# src/data/database.py
from __future__ import annotations
from dataclasses import dataclass, field
from typing import Optional
import json, re
from pathlib import Path

# ── Đường dẫn tới seed data ────────────────────────────────────────────────────
_SEED_DIR = Path(__file__).parent.parent.parent / "seeds" / "data"


def _load_js(filename: str) -> list[dict]:
    """Đọc file .data.js dạng module.exports = [...]"""
    text = (_SEED_DIR / filename).read_text(encoding="utf-8")
    # Bỏ module.exports = và parse JSON
    text = re.sub(r"^module\.exports\s*=\s*", "", text.strip())
    text = re.sub(r",\s*\]", "]", text)   # trailing comma
    text = re.sub(r",\s*\}", "}", text)
    return json.loads(text)


# ── Models ─────────────────────────────────────────────────────────────────────

@dataclass
class Movie:
    id: str           # MongoDB _id string
    title: str
    year: int
    genres: list[str]
    rating: str       # "T13", "T16", "T18", "P"
    emoji: str
    description: str
    director: str = ""
    cast: list[str] = field(default_factory=list)
    duration: int = 0
    poster_url: str = ""
    backdrop_url: str = ""
    status: str = "now_showing"
    formats: list[str] = field(default_factory=list)
    trailer_url: str = ""


@dataclass
class User:
    id: str           # MongoDB _id string
    name: str
    email: str
    avatar: str
    username: str
    password: str
    role: str = "user"
    status: str = "active"
    favorite_genres: list[str] = field(default_factory=list)
    watch_history: list[str] = field(default_factory=list)
    rating: dict[str, int] = field(default_factory=dict)


# ── Load từ seed files ─────────────────────────────────────────────────────────

def _parse_year(release_date: str) -> int:
    try:
        return int(release_date[:4])
    except Exception:
        return 0


def _build_movies() -> list[Movie]:
    raw = _load_js("movies.data.js")
    movies = []
    for i, m in enumerate(raw):
        movies.append(Movie(
            id           = m["_id"],
            title        = m["title"],
            year         = _parse_year(m.get("releaseDate", "2024")),
            genres       = m.get("genres", []),
            rating       = m.get("rating", ""),
            emoji        = ["🎬","🎭","🌟","⚡","🎪","🎥","🎦","🎠","🎡","🎢"][i % 10],
            description  = m.get("description", ""),
            director     = m.get("director", ""),
            cast         = m.get("cast", []),
            duration     = m.get("duration", 0),
            poster_url   = m.get("posterUrl", ""),
            backdrop_url = m.get("backdropUrl", ""),
            status       = m.get("status", "now_showing"),
            formats      = m.get("formats", []),
            trailer_url  = m.get("trailerUrl", ""),
        ))
    return movies


def _build_users() -> list[User]:
    raw = _load_js("users.data.js")
    users = []
    for u in raw:
        users.append(User(
            id       = u["_id"],
            name     = u["name"],
            email    = u["email"],
            avatar   = u.get("avatar", ""),
            username = u["email"].split("@")[0],  # dùng phần trước @ làm username
            password = u["password"],
            role     = u.get("role", "user"),
            status   = u.get("status", "active"),
        ))
    return users


_MOVIES: list[Movie] = _build_movies()
_USERS:  list[User]  = _build_users()

# ── Repositories ───────────────────────────────────────────────────────────────

class MovieRepository:
    @staticmethod
    def find_all() -> list[Movie]:
        return _MOVIES

    @staticmethod
    def find_by_id(movie_id) -> Optional[Movie]:
        mid = str(movie_id)
        return next((m for m in _MOVIES if m.id == mid), None)

    @staticmethod
    def find_by_genre(genre: str) -> list[Movie]:
        return sorted(
            [m for m in _MOVIES if any(g.lower() == genre.lower() for g in m.genres)],
            key=lambda m: m.rating, reverse=True,
        )

    @staticmethod
    def get_top_rated(limit: int = 10) -> list[Movie]:
        return sorted(_MOVIES, key=lambda m: m.rating, reverse=True)[:limit]

    @staticmethod
    def get_all_genres() -> list[str]:
        genres: set[str] = set()
        for m in _MOVIES:
            genres.update(m.genres)
        return sorted(genres)

    @staticmethod
    def get_stats() -> dict:
        return {
            "total_movies":  len(_MOVIES),
            "total_users":   len(_USERS),
            "total_genres":  len(MovieRepository.get_all_genres()),
            "total_ratings": sum(len(u.rating) for u in _USERS),
        }


class UserRepository:
    @staticmethod
    def find_all() -> list[User]:
        return _USERS

    @staticmethod
    def find_by_id(movie_id) -> Optional[Movie]:
        mid = str(movie_id)
        return next((m for m in _MOVIES if m.id == mid), None)

    @staticmethod
    def find_by_username(username: str) -> Optional[User]:
        return next((u for u in _USERS if u.username == username), None)

    @staticmethod
    def get_unwatched_movies(user_id: int) -> list[Movie]:
        user = UserRepository.find_by_id(user_id)
        if not user:
            return []
        return sorted(
            [m for m in _MOVIES if m.id not in user.watch_history],
            key=lambda m: m.rating, reverse=True,
        )

    @staticmethod
    def get_recommended_movies(user_id: int, limit: int = 6) -> list[Movie]:
        user = UserRepository.find_by_id(user_id)
        if not user:
            return []
        unwatched = UserRepository.get_unwatched_movies(user_id)
        by_genre  = [m for m in unwatched if any(g in user.favorite_genres for g in m.genres)]
        extras    = [m for m in unwatched if m not in by_genre]
        return (by_genre + extras)[:limit]
