
from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field, field_validator

from src.langchain_chain.chain import chat, clear_session, get_session_memory_summary
from backend.seeds.chatresponse import UserRepository

router = APIRouter(prefix="/api/chatbot", tags=["chatbot"])


# ── Schemas ───────────────────────────────────────────────────────────────────

class ChatRequest(BaseModel):
    session_id: str = Field(..., min_length=1)
    message:    str = Field(..., min_length=1, max_length=2000)
    user_id:    int | None = Field(default=None, ge=1)

    @field_validator("message")
    @classmethod
    def strip_message(cls, v: str) -> str:
        return v.strip()


class ChatResponse(BaseModel):
    success:    bool
    session_id: str
    reply:      str
    movie_ids:  list[int]


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.post("/", response_model=ChatResponse)
async def send_message(body: ChatRequest) -> ChatResponse:
    if body.user_id and not UserRepository.find_by_id(body.user_id):
        raise HTTPException(status_code=404, detail=f"Không tìm thấy user ID={body.user_id}")

    result = await chat(
        session_id=body.session_id,
        message=body.message,
        user_id=body.user_id,
    )
    return ChatResponse(
        success=True,
        session_id=body.session_id,
        reply=result["text"],
        movie_ids=result["movie_ids"],
    )


@router.delete("/session/{session_id}")
async def logout_session(session_id: str) -> dict:
    """Xoá toàn bộ bộ nhớ phiên — gọi khi user đăng xuất."""
    clear_session(session_id)
    return {"success": True, "message": f'Phiên "{session_id}" đã được xoá.'}


@router.get("/memory/{session_id}")
async def get_memory(session_id: str) -> dict:
    """Xem bộ nhớ ngắn hạn của phiên hiện tại (debug)."""
    summary = get_session_memory_summary(session_id)
    return {"success": True, "session_id": session_id, "summary": summary}
