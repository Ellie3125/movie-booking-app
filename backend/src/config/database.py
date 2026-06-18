from __future__ import annotations

from dataclasses import dataclass, field
from typing import Optional

from pymongo import MongoClient
from bson import ObjectId
from dotenv import load_dotenv
import os

load_dotenv()

client = MongoClient(os.getenv("MONGODB_URI"))

db = client.get_default_database()

movies_collection = db["movies"]
users_collection = db["users"]
bookings_collection = db["bookings"]


# ── Models ────────────────────────────────────────────────────────────────────

@dataclass
class Movie:
    id: str
    title: str
    year: int
    genres: list[str]
    rating: float
    emoji: str = ""
    description: str = ""
    director: str = ""
    cast: list[str] = field(default_factory=list)


@dataclass
class User:
    id: str
    name: str
    email: str
    avatar: str = ""
    username: str = ""
    password: str = ""
    favorite_genres: list[str] = field(default_factory=list)
    watch_history: list[str] = field(default_factory=list)
    rating: dict = field(default_factory=dict)


# ── Helpers ───────────────────────────────────────────────────────────────────

def _movie_from_doc(doc) -> Movie:
    return Movie(
        id=str(doc.get("_id")),
        title=doc.get("title", ""),
        year=doc.get("year", 0),
        genres=doc.get("genres", []),
        rating=float(doc.get("rating", 0)),
        emoji=doc.get("emoji", ""),
        description=doc.get("description", ""),
        director=doc.get("director", ""),
        cast=doc.get("cast", []),
    )


def _user_from_doc(doc) -> User:
    return User(
        id=str(doc.get("_id")),
        name=doc.get("name", ""),
        email=doc.get("email", ""),
        avatar=doc.get("avatar", ""),
        username=doc.get("username", ""),
        password=doc.get("password", ""),
        favorite_genres=doc.get("favorite_genres", []),
        watch_history=doc.get("watch_history", []),
        rating=doc.get("rating", {}),
    )


# ── Repositories ──────────────────────────────────────────────────────────────

class MovieRepository:

    @staticmethod
    def find_all() -> list[Movie]:
        return [_movie_from_doc(doc) for doc in movies_collection.find()]

    @staticmethod
    def find_by_id(movie_id) -> Optional[Movie]:
        try:
            doc = movies_collection.find_one(
                {"_id": ObjectId(movie_id)}
            )
        except Exception:
            doc = movies_collection.find_one(
                {"id": movie_id}
            )

        return _movie_from_doc(doc) if doc else None

    @staticmethod
    def find_by_genre(genre: str) -> list[Movie]:
        docs = movies_collection.find({
            "genres": {
                "$regex": f"^{genre}$",
                "$options": "i"
            }
        })

        movies = [_movie_from_doc(doc) for doc in docs]

        return sorted(
            movies,
            key=lambda m: m.rating,
            reverse=True
        )

    @staticmethod
    def get_top_rated(limit: int = 10) -> list[Movie]:
        docs = movies_collection.find().sort(
            "rating",
            -1
        ).limit(limit)

        return [_movie_from_doc(doc) for doc in docs]

    @staticmethod
    def get_all_genres() -> list[str]:

        genres = set()

        for doc in movies_collection.find(
            {},
            {"genres": 1}
        ):
            genres.update(doc.get("genres", []))

        return sorted(list(genres))

    @staticmethod
    def get_stats() -> dict:
        return {
            "total_movies": movies_collection.count_documents({}),
            "total_users": users_collection.count_documents({}),
            "total_genres": len(MovieRepository.get_all_genres()),
        }


class UserRepository:

    @staticmethod
    def find_all() -> list[User]:
        return [_user_from_doc(doc) for doc in users_collection.find()]

    @staticmethod
    def find_by_id(user_id) -> Optional[User]:
        try:
            doc = users_collection.find_one(
                {"_id": ObjectId(user_id)}
            )
        except Exception:
            doc = users_collection.find_one(
                {"id": user_id}
            )

        return _user_from_doc(doc) if doc else None

    @staticmethod
    def find_by_username(username: str) -> Optional[User]:
        doc = users_collection.find_one(
            {"username": username}
        )

        return _user_from_doc(doc) if doc else None

    @staticmethod
    def get_unwatched_movies(user_id) -> list[Movie]:

        user = UserRepository.find_by_id(user_id)

        if not user:
            return []

        watched = set(user.watch_history)

        movies = [
            m
            for m in MovieRepository.find_all()
            if m.id not in watched
        ]

        return sorted(
            movies,
            key=lambda m: m.rating,
            reverse=True
        )

    @staticmethod
    def get_recommended_movies(
        user_id,
        limit: int = 6
    ) -> list[Movie]:

        user = UserRepository.find_by_id(user_id)

        if not user:
            return []

        unwatched = UserRepository.get_unwatched_movies(
            user_id
        )

        by_genre = [
            m
            for m in unwatched
            if any(
                g in user.favorite_genres
                for g in m.genres
            )
        ]

        extras = [
            m
            for m in unwatched
            if m not in by_genre
        ]

        return (by_genre + extras)[:limit]