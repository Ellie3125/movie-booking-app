from __future__ import annotations
from dataclasses import dataclass, field
from typing import Optional
from pymongo import MongoClient

# ── Mongo setup ───────────────────────────────────────────────
client = MongoClient("mongodb://localhost:27017")
db = client["movie_booking"]

movies_col = db["movies"]
users_col = db["users"]

# ── Models ────────────────────────────────────────────────────

@dataclass
class Movie:
    id: str
    title: str
    year: int
    genres: list[str]
    rating: str
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
    id: str
    name: str
    email: str
    avatar: str
    username: str
    password: str
    role: str = "user"
    status: str = "active"
    favorite_genres: list[str] = field(default_factory=list)
    watch_history: list[str] = field(default_factory=list)
    rating: dict = field(default_factory=dict)


# ── Mapper helpers ────────────────────────────────────────────

def map_movie(m, emoji="🎬") -> Movie:
    return Movie(
        id=m.get("_id"),
        title=m.get("title"),
        year=int((m.get("releaseDate") or "2024")[:4]),
        genres=m.get("genres", []),
        rating=m.get("rating", ""),
        emoji=emoji,
        description=m.get("description", ""),
        director=m.get("director", ""),
        cast=m.get("cast", []),
        duration=m.get("duration", 0),
        poster_url=m.get("posterUrl", ""),
        backdrop_url=m.get("backdropUrl", ""),
        status=m.get("status", "now_showing"),
        formats=m.get("formats", []),
        trailer_url=m.get("trailerUrl", ""),
    )


def map_user(u) -> User:
    return User(
        id=u.get("_id"),
        name=u.get("fullName") or u.get("name", ""),
        email=u.get("email"),
        avatar=u.get("avatarUrl") or u.get("avatar", ""),
        username=(u.get("email") or "").split("@")[0],
        password=u.get("password"),
        role=u.get("role", "user"),
        status=u.get("status", "active"),
        favorite_genres=u.get("favorite_genres", []),
        watch_history=u.get("watch_history", []),
        rating=u.get("rating", {}),
    )


# ── Repository Movie ──────────────────────────────────────────

class MovieRepository:

    @staticmethod
    def find_all() -> list[Movie]:
        return [
            map_movie(m, emoji="🎬")
            for m in movies_col.find({})
        ]

    @staticmethod
    def find_by_id(movie_id) -> Optional[Movie]:
        m = movies_col.find_one({"_id": str(movie_id)})
        return map_movie(m) if m else None

    @staticmethod
    def find_by_genre(genre: str) -> list[Movie]:
        return [
            map_movie(m)
            for m in movies_col.find({"genres": {"$regex": genre, "$options": "i"}})
        ]

    @staticmethod
    def get_top_rated(limit: int = 10) -> list[Movie]:
        return [
            map_movie(m)
            for m in movies_col.find({}).limit(limit)
        ]

    @staticmethod
    def get_all_genres() -> list[str]:
        genres = set()
        for m in movies_col.find({}):
            genres.update(m.get("genres", []))
        return sorted(genres)

    @staticmethod
    def get_stats() -> dict:
        return {
            "total_movies": movies_col.count_documents({}),
            "total_users": users_col.count_documents({}),
            "total_genres": len(MovieRepository.get_all_genres()),
        }


# ── Repository User ───────────────────────────────────────────

class UserRepository:

    @staticmethod
    def find_all() -> list[User]:
        return [map_user(u) for u in users_col.find({})]

    @staticmethod
    def find_by_id(user_id) -> Optional[User]:
        u = users_col.find_one({"_id": str(user_id)})
        return map_user(u) if u else None

    @staticmethod
    def find_by_username(username: str) -> Optional[User]:
        u = users_col.find_one({"email": {"$regex": username, "$options": "i"}})
        return map_user(u) if u else None

    @staticmethod
    def get_unwatched_movies(user_id: str) -> list[Movie]:
        user = UserRepository.find_by_id(user_id)
        if not user:
            return []

        return [
            map_movie(m)
            for m in movies_col.find({
                "_id": {"$nin": user.watch_history}
            })
        ]

    @staticmethod
    def get_recommended_movies(user_id: str, limit: int = 6) -> list[Movie]:
        user = UserRepository.find_by_id(user_id)
        if not user:
            return []

        unwatched = UserRepository.get_unwatched_movies(user_id)

        by_genre = [
            m for m in unwatched
            if any(g in user.favorite_genres for g in m.genres)
        ]

        extras = [m for m in unwatched if m not in by_genre]

        return (by_genre + extras)[:limit]