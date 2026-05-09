# AGENTS.md - Movie Booking App AI Instructions

## 1. Project Overview & Tech Stack

This is a comprehensive cinema ticket booking ecosystem divided into three main parts:

1.  **Backend (BE)**: Node.js, Express, MongoDB (Mongoose), `jsonwebtoken`, `joi`.
2.  **Admin Web**: React, TypeScript, TailAdmin, `axios`, `localStorage`.
3.  **Mobile App**: React Native, Expo, `expo-secure-store`, `expo-location`.

---

## 2. Part 1: Backend (Core API)

*   **Standard**: MVC + Service Layer.
*   **Goal**: Scalable, secure, and performant API.
*   **Key Responsibilities**:
    *   Auth (JWT), Booking Logic, Seat Locking.
    *   Payment Simulation, Statistics Generation.
    *   CRUD for Movies, Cinemas, Showtimes.

---

## 3. Part 2: Admin Web (Management)

*   **Standard**: React + TS + TailAdmin.
*   **Goal**: Powerful, easy-to-use management interface.
*   **Key Responsibilities**:
    *   Real-time dashboard statistics.
    *   Complex Seat Layout Editor.
    *   Bulk management for Showtimes and Users.
    *   Media upload handling.

---

## 4. Part 3: Mobile App (Customer Experience)

*   **Standard**: React Native + Expo.
*   **Goal**: Premium, smooth, and bug-free booking experience.
*   **Key Responsibilities**:
    *   Intuitive movie discovery.
    *   Interactive seat selection (high performance).
    *   Smooth booking flow (Select Movie -> Cinema -> Showtime -> Seat -> Pay -> Ticket).
    *   Personalized profiles and booking history.

---

## 5. Core AI Behavior Rules

1.  **Context First**: Always read `PROJECT_CONTEXT.md` and related files before any action.
2.  **Consistency**: Follow the established patterns for each part (e.g., TS for Admin, MVC for BE).
3.  **Incremental**: Make small, safe changes. Explain the "why" and "how".
4.  **No Deletions**: Never silently remove existing features or configs.
5.  **Professional UI**: Every UI change must feel "Premium" and "Modern".
6.  **Verify Everything**: Use verification tools before claiming completion.
