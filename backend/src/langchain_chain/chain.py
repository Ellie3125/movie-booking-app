from __future__ import annotations

import json
import logging
import re
import contextvars
from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional

# ── LangChain 1.3.x core ─────────────────────────────────────────────────────
from langchain.agents import create_agent
from langchain.agents.middleware import wrap_model_call, ModelRequest, ModelResponse
from langchain.tools import tool
from langchain_core.chat_history import InMemoryChatMessageHistory
from langchain_core.messages import HumanMessage, AIMessage
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import Runnable
from langgraph.store.memory import InMemoryStore
from typing_extensions import TypedDict

# ── LangChain Groq ────────────────────────────────────────────────────────────
from langchain_groq import ChatGroq
from langchain_google_genai import ChatGoogleGenerativeAI

from typing_extensions import Annotated, TypedDict
from langgraph.graph.message import add_messages
from langchain_core.messages import BaseMessage

# ── Local DB ──────────────────────────────────────────────────────────────────
from src.data.database import UserRepository, MovieRepository

logger = logging.getLogger(__name__)
_ctx_user_id  = contextvars.ContextVar("user_id",  default="anon")
_ctx_username = contextvars.ContextVar("username", default="anonymous")

# ══════════════════════════════════════════════════════════════════════════════
# 1. STORE + STATE SCHEMA
# ══════════════════════════════════════════════════════════════════════════════

# InMemoryStore — swap sang DB-backed store (Redis, Postgres...) trong production
store = InMemoryStore()

# ── Reducer helpers ───────────────────────────────────────────────────────────

def _keep_last(current: str, update: str) -> str:
    """Reducer cho scalar field — luôn lấy giá trị mới nhất."""
    return update if update is not None else current


def _merge_messages(
    current: list[BaseMessage],
    update:  list[BaseMessage],
) -> list[BaseMessage]:
    """Dùng add_messages của LangGraph — tự dedupe theo id."""
    return add_messages(current, update)


# ── State schema ──────────────────────────────────────────────────────────────

class Context(TypedDict):
    # Conversation history — append-only, dedupe theo message id
    messages:  Annotated[list[BaseMessage], _merge_messages]

    # Scalar fields — last-write-wins
    user_id:   Annotated[str, _keep_last]
    username:  Annotated[str, _keep_last]


# TypedDict định nghĩa cấu trúc LTM để LLM biết cách ghi
class MovieMemoryData(TypedDict):
    discussed_movies: list   # [{id,title,year,genres,rating,in_db}]
    preferred_genres: list   # ["Hành động", ...]
    disliked_movies:  list   # ["phim X", ...]
    total_sessions:   int
    last_active:      str


# ══════════════════════════════════════════════════════════════════════════════
# 2. LTM HELPERS
# ══════════════════════════════════════════════════════════════════════════════

def _default_ltm() -> dict:
    return {
        "discussed_movies": [],
        "preferred_genres": [],
        "disliked_movies":  [],
        "total_sessions":   0,
        "last_active":      None,
    }


def get_ltm(username: str) -> dict:
    """Đọc LTM từ store."""
    item = store.get(("movie_memory",), username)
    return item.value if item else _default_ltm()


def put_ltm(username: str, ltm: dict) -> None:
    """Ghi LTM vào store."""
    ltm["last_active"] = datetime.now().isoformat()
    store.put(("movie_memory",), username, ltm)


def _ltm_add_movie(ltm: dict, m: dict) -> None:
    titles = {x["title"].lower() for x in ltm["discussed_movies"]}
    if m["title"].lower() not in titles:
        ltm["discussed_movies"].append({**m, "last_seen": datetime.now().isoformat()})
    else:
        for x in ltm["discussed_movies"]:
            if x["title"].lower() == m["title"].lower():
                x["last_seen"] = datetime.now().isoformat()


def _ltm_add_genre(ltm: dict, genre: str) -> None:
    if genre not in ltm["preferred_genres"]:
        ltm["preferred_genres"].append(genre)


def _ltm_summary(ltm: dict) -> str:
    lines = ["🧠 BỘ NHỚ DÀI HẠN (xuyên các phiên):"]
    if ltm["preferred_genres"]:
        lines.append(f"  Thể loại hay hỏi: {', '.join(ltm['preferred_genres'])}")
    if ltm["discussed_movies"]:
        recent = ltm["discussed_movies"][-10:]
        lines.append(f"  Đã thảo luận ({len(ltm['discussed_movies'])} phim, 10 gần nhất):")
        for m in recent:
            tag = "🎬 rạp" if m.get("in_db") else "🌐 streaming"
            lines.append(f"    • {m['title']} ({m.get('year','?')}) [{tag}]")
    if ltm.get("disliked_movies"):
        lines.append(f"  Không thích: {', '.join(ltm['disliked_movies'])}")
    if ltm.get("total_sessions"):
        lines.append(f"  Số phiên: {ltm['total_sessions']}")
    return "\n".join(lines) if len(lines) > 1 else "Chưa có lịch sử dài hạn."


# ══════════════════════════════════════════════════════════════════════════════
# 3. LONG-TERM SESSION MEMORY  (in-RAM)
# ══════════════════════════════════════════════════════════════════════════════

@dataclass
class SessionMemory:
    username: str
    mentioned_movies: list = field(default_factory=list)
    mentioned_genres: list = field(default_factory=list)
    conversation_turns: int = 0

    def add_movie(self, m: dict) -> None:
        titles = {x["title"].lower() for x in self.mentioned_movies}
        if m["title"].lower() not in titles:
            self.mentioned_movies.append({
                "id": m.get("id"), "title": m["title"],
                "genres": m.get("genres", []), "year": m.get("year"),
                "rating": m.get("rating"), "in_db": m.get("in_db", True),
            })
            for g in m.get("genres", []):
                self.add_genre(g)

    def add_genre(self, g: str) -> None:
        if g not in self.mentioned_genres:
            self.mentioned_genres.append(g)

    def extract_and_store(self, text: str) -> None:
        tl = text.lower()
        for movie in MovieRepository.find_all():
            if movie.title.lower() in tl:
                self.add_movie({
                    "id": movie.id, "title": movie.title,
                    "genres": movie.genres, "year": movie.year,
                    "rating": movie.rating, "in_db": True,
                })
        db_lower = {m.title.lower() for m in MovieRepository.find_all()}
        for line in text.splitlines():
            if "không có tại rạp" not in line.lower():
                continue
            strip      = re.sub(r"^[\s\-\u2013\u2022]+", "", line).strip()
            title_part = re.split(r"\s*[\(\-\u2013]", strip)[0].strip()
            yr = re.search(r"\((\d{4})\)", line)
            if not title_part or len(title_part) < 2 or title_part.lower() in db_lower:
                continue
            self.add_movie({
                "id": None, "title": title_part, "genres": [],
                "year": int(yr.group(1)) if yr else None,
                "rating": None, "in_db": False,
            })
        for genre in MovieRepository.get_all_genres():
            if genre.lower() in tl:
                self.add_genre(genre)

    def get_summary(self) -> str:
        if not self.mentioned_movies and not self.mentioned_genres:
            return "Chưa có phim hoặc thể loại nào được nhắc trong phiên này."
        lines = ["📌 BỘ NHỚ PHIÊN (session hiện tại):"]
        if self.mentioned_genres:
            lines.append(f"  Thể loại: {', '.join(self.mentioned_genres)}")
        if self.mentioned_movies:
            lines.append(f"  Phim đã nhắc ({len(self.mentioned_movies)}):")
            for m in self.mentioned_movies:
                g = ", ".join(m["genres"]) if m["genres"] else "—"
                lines.append(f"    • {m['title']} ({m['year']}) [{g}] ⭐{m['rating']}")
        return "\n".join(lines)


# ── In-memory session stores ──────────────────────────────────────────────────
_conv_store: dict[str, InMemoryChatMessageHistory] = {}
_mem_store:  dict[str, SessionMemory]              = {}


def _get_conv(sid: str) -> InMemoryChatMessageHistory:
    if sid not in _conv_store:
        _conv_store[sid] = InMemoryChatMessageHistory()
    return _conv_store[sid]


def _get_session_mem(sid: str, username: str) -> SessionMemory:
    if sid not in _mem_store:
        _mem_store[sid] = SessionMemory(username=username)
    return _mem_store[sid]


# ══════════════════════════════════════════════════════════════════════════════
# 4. TOOLS
# ══════════════════════════════════════════════════════════════════════════════

@tool
def search_movies(query: str) -> str:
    """Tìm phim theo tên hoặc thể loại. Input: tên/thể loại tiếng Việt."""
    ql      = query.lower()
    results = MovieRepository.find_by_genre(query) or [
        m for m in MovieRepository.find_all() if ql in m.title.lower()
    ]
    results = results[:8]
    if not results:
        return f"Không tìm thấy phim với '{query}'."
    lines = [f"Tìm thấy {len(results)} phim:"]
    for m in results:
        lines.append(
            f"  [ID:{m.id}] {m.emoji} {m.title} ({m.year}) "
            f"| {'/'.join(m.genres)} | ⭐{m.rating} | ĐD: {m.director}"
        )
    return "\n".join(lines)


@tool
def get_user_profile() -> str:
    """Get current user profile: favorite genres and watch history."""
    uid  = int(_ctx_user_id.get()) if _ctx_user_id.get() != "anon" else None
    user = UserRepository.find_by_id(uid) if uid else None
    watched = [
        f"{m.title} ({m.year})"
        for mid in user.watch_history
        if (m := MovieRepository.find_by_id(mid))
    ]
    top = [
        f"{MovieRepository.find_by_id(int(mid)).title} ({sc}⭐)"
        for mid, sc in user.rating.items()
        if sc >= 4 and MovieRepository.find_by_id(int(mid))
    ]
    return (
        f"Tên: {user.name} {user.avatar}\n"
        f"Email: {user.email}\n"
        f"Thể loại yêu thích: {', '.join(user.favorite_genres)}\n"
        f"Đã xem ({len(watched)} phim): {', '.join(watched)}\n"
        f"Đánh giá cao: {', '.join(top) or 'chưa có'}"
    )


@tool
def get_recommendations(limit: str = "6") -> str:
    """Get 6 personalized movie recommendations for the current logged-in user."""
    uid = int(_ctx_user_id.get()) if _ctx_user_id.get() != "anon" else None
    if not uid:
        return "Login required."
    try:
        n = min(int(limit), 10)
    except ValueError:
        n = 6
    movies = UserRepository.get_recommended_movies(uid, n)
    if not movies:
        return "Không có phim phù hợp (bạn đã xem hết!)."
    lines = [f"Gợi ý {len(movies)} phim:"]
    for m in movies:
        lines.append(
            f"  [ID:{m.id}] {m.emoji} {m.title} ({m.year}) "
            f"| {'/'.join(m.genres)} | ⭐{m.rating}\n    {m.description}"
        )
    return "\n".join(lines)


@tool
def get_movie_detail(movie_id: int) -> str:
    """Lấy chi tiết một phim theo ID. Input: số nguyên, ví dụ '5'."""
    m = MovieRepository.find_by_id(movie_id)
    if not m:
        return f"Không tìm thấy phim ID={movie_id}."
    return (
        f"🎬 {m.title} ({m.year})\n"
        f"Thể loại : {', '.join(m.genres)}\n"
        f"Đạo diễn : {m.director}\n"
        f"Diễn viên: {', '.join(m.cast)}\n"
        f"Rating   : ⭐{m.rating}/5\n"
        f"Mô tả    : {m.description}"
    )


@tool
def get_movie_memory() -> str:
    """Read user's long-term movie memory: discussed movies and favorite genres."""
    username = _ctx_username.get()
    item = store.get(("movie_memory",), username)
    if not item:
        return "No long-term memory found."
    return str(item.value)


@tool
def save_movie_memory(movie_memory: str) -> str:
    """Save user's long-term memory. Input: JSON string with fields:
    discussed_movies (list), preferred_genres (list), 
    disliked_movies (list), total_sessions (int), last_active (str).
    Example: '{"discussed_movies": [], "preferred_genres": ["Hành động"]}'
    """
    username = _ctx_username.get()
    try:
        data = json.loads(movie_memory)
    except json.JSONDecodeError:
        return "Error: invalid JSON input."
    store.put(("movie_memory",), username, data)
    return "Memory saved successfully."

TOOLS = [
    search_movies,
    get_user_profile,
    get_recommendations,
    get_movie_detail,
    get_movie_memory,
]


# ══════════════════════════════════════════════════════════════════════════════
# 5. LLM + MIDDLEWARE (dynamic model selection)
# ══════════════════════════════════════════════════════════════════════════════

_llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    temperature=0.7,
    max_output_tokens=1536,
)

# ══════════════════════════════════════════════════════════════════════════════
# 6. SYSTEM PROMPT
# ══════════════════════════════════════════════════════════════════════════════

_SYSTEM_TMPL = """\
Bạn là **CineBot** — trợ lý AI gợi ý phim thông minh cho hệ thống rạp chiếu phim.
Luôn trả lời **bằng tiếng Việt**, thân thiện và hữu ích.
Dùng tools để tra cứu thông tin chính xác từ database.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{long_term_memory}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{session_memory}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{user_block}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## QUY TẮC
1. Dùng get_recommendations trước khi gợi ý phim cá nhân.
2. Dùng get_movie_memory để tra cứu lịch sử dài hạn trước khi trả lời.
3. Dùng save_movie_memory để lưu phim/thể loại quan trọng sau khi thảo luận.
4. Tách 2 nhóm khi gợi ý:
   🎬 ĐANG CHIẾU TẠI RẠP — kèm <MOVIES>[{{"id":1}},{{"id":2}}]</MOVIES>
   🌐 GỢI Ý THÊM — phim kinh điển (The Godfather...), ghi "(Không có tại rạp — xem trên streaming)"
5. KHÔNG hiển thị ID trong câu trả lời.
6. Dựa vào bộ nhớ để TRÁNH gợi ý lặp lại.
"""


def _build_system(user_id: Optional[int], session_mem: SessionMemory, username: str) -> str:
    ltm  = get_ltm(username)
    user = UserRepository.find_by_id(user_id) if user_id else None
    user_block = (
        f"## NGƯỜI DÙNG: {user.name} {user.avatar}\n"
        f"Yêu thích: {', '.join(user.favorite_genres)}\n"
        f"Đã xem: {', '.join(MovieRepository.find_by_id(mid).title for mid in user.watch_history if MovieRepository.find_by_id(mid))}"
        if user else "## CHƯA ĐĂNG NHẬP"
    )
    return _SYSTEM_TMPL.format(
        long_term_memory=_ltm_summary(ltm),
        session_memory=session_mem.get_summary(),
        user_block=user_block,
    )


# ══════════════════════════════════════════════════════════════════════════════
# 7. OUTPUT PARSER
# ══════════════════════════════════════════════════════════════════════════════

_MOVIES_RE = re.compile(r"<MOVIES>(.*?)</MOVIES>", re.DOTALL)


def _parse_output(text: str) -> dict:
    ids:   list[int] = []
    m = _MOVIES_RE.search(text)
    if m:
        try:
            ids = [int(x["id"]) for x in json.loads(m.group(1)) if "id" in x]
        except Exception as e:
            logger.warning("OutputParser error: %s", e)
    clean = _MOVIES_RE.sub("", text).strip()
    return {"text": clean, "movie_ids": ids}


# ══════════════════════════════════════════════════════════════════════════════
# 8. SESSION LIFECYCLE
# ══════════════════════════════════════════════════════════════════════════════

def clear_session(session_id: str) -> None:
    """Xoá session — gọi khi logout. Merge SessionMemory vào LTM trước."""
    mem = _mem_store.get(session_id)
    if mem:
        ltm = get_ltm(mem.username)
        for m in mem.mentioned_movies:
            _ltm_add_movie(ltm, m)
        for g in mem.mentioned_genres:
            _ltm_add_genre(ltm, g)
        ltm["total_sessions"] = ltm.get("total_sessions", 0) + 1
        put_ltm(mem.username, ltm)
        logger.info("LTM saved for %s: %d movies, %d genres",
                    mem.username, len(ltm["discussed_movies"]), len(ltm["preferred_genres"]))
    _conv_store.pop(session_id, None)
    _mem_store.pop(session_id, None)


def get_session_memory_summary(session_id: str) -> str:
    mem = _mem_store.get(session_id)
    if not mem:
        return "Không có bộ nhớ phiên."
    ltm = get_ltm(mem.username)
    return f"{mem.get_summary()}\n\n{_ltm_summary(ltm)}"


# ══════════════════════════════════════════════════════════════════════════════
# 9. PUBLIC API
# ══════════════════════════════════════════════════════════════════════════════

async def chat(
    session_id: str,
    message:    str,
    user_id:    Optional[int] = None,
) -> dict:
    """
    Main async entry point.

    Returns: { "text": str, "movie_ids": list[int] }
    """
    user     = UserRepository.find_by_id(user_id) if user_id else None
    username = user.username if user else "anonymous"
    uid_str  = str(user_id) if user_id else "anon"

    conv        = _get_conv(session_id)
    session_mem = _get_session_mem(session_id, username)
    session_mem.conversation_turns += 1
    session_mem.extract_and_store(message)

    system_prompt = _build_system(user_id, session_mem, username)

    # Tạo agent với create_agent + middleware + store + state_schema
    agent: Runnable = create_agent(
        model=_llm,                    # default model (middleware sẽ override)
        tools=TOOLS, 
        system_prompt=system_prompt,
        store=store,                        # InMemoryStore cho LTM
        state_schema=Context,             # schema để agent biết context type
        # middleware=[dynamic_model_selection],
    )

    # Lọc history — chỉ giữ HumanMessage và AIMessage thuần (bỏ tool messages)
    history_msgs = [
        m for m in conv.messages[-8:]
        if isinstance(m, (HumanMessage, AIMessage))
        and not getattr(m, "tool_calls", None)
        and not getattr(m, "tool_call_id", None)
    ]
    input_messages = list(history_msgs) + [HumanMessage(content=message)]

    _ctx_user_id.set(uid_str)
    _ctx_username.set(username)

    # Invoke agent — truyền context để tools truy cập store đúng user
    result = await agent.ainvoke(
        {"messages": input_messages},
        # state=Context(messages=input_messages, 
        #               user_id=uid_str, username=username),
    )

    # Trích output
    raw_output = ""
    if isinstance(result, dict) and "messages" in result:
        for msg in reversed(result["messages"]):
            role = getattr(msg, "type", "") or getattr(msg, "role", "")
            if role in ("ai", "assistant") and getattr(msg, "content", ""):
                raw_output = msg.content
                break
        if not raw_output and result["messages"]:
            raw_output = getattr(result["messages"][-1], "content", "")
    elif isinstance(result, str):
        raw_output = result

    # Lưu history
    conv.add_user_message(message)
    conv.add_ai_message(raw_output)

    # Cập nhật session memory
    session_mem.extract_and_store(raw_output)

    # Auto-merge vào LTM mỗi 5 turns
    if session_mem.conversation_turns % 5 == 0:
        ltm = get_ltm(username)
        for m in session_mem.mentioned_movies:
            _ltm_add_movie(ltm, m)
        for g in session_mem.mentioned_genres:
            _ltm_add_genre(ltm, g)
        put_ltm(username, ltm)

    return _parse_output(raw_output)
