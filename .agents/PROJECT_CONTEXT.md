# PROJECT_CONTEXT.md

## Project Context

Movie Booking App is a comprehensive cinema ticket booking ecosystem divided into 3 main parts:

1.  **Part 1: Backend (Core API)** - Node.js, Express, MongoDB, `jsonwebtoken`, `joi`.
2.  **Part 2: Admin Web (Management)** - React, TypeScript, TailAdmin, `axios`, `localStorage`.
3.  **Part 3: Mobile App (Customer Experience)** - React Native, Expo, `expo-secure-store`, `expo-location`.

---

## Backend Structure

Main backend domains:

* auth
* users
* movies
* genres
* cinemas
* rooms
* seat layouts
* showtimes
* bookings
* payments
* tickets
* statistics

Backend stack:

* Express.js
* MongoDB
* Mongoose
* JWT authentication

---

## Mobile App

Tech:

* React Native
* Expo

Main screens:

* Home
* Movie Detail
* Cinema Selection
* Showtime Selection
* Seat Selection
* Payment
* Ticket
* Booking History
* Profile

---

## Admin Dashboard

Tech:

* React
* TypeScript
* TailAdmin

Main management features:

* Movie CRUD
* Cinema CRUD
* Room CRUD
* Seat Layout Editor
* Showtime CRUD
* Booking Management
* User Management
* Dashboard Statistics

---

## Important Business Rules

### Seat Layout Rules

* Layouts may contain:

  * normal seats
  * couple seats
  * empty spaces
  * aisles
  * inactive cells

* Empty spaces are NOT seats.

* activeSeatCount only counts active real seats.

* Couple seats represent 2 seats and must be selected together.

* Room stores the base layout.

* Showtime stores booking state.

---

## Booking Rules

* Users cannot double-book seats.
* Seats should be temporarily locked during checkout.
* Booked seats cannot be selected again.
* Payment success creates ticket records.
* Booking history must persist.

---

## Payment Rules

Payment system is simulated/fake unless explicitly upgraded.

Do not integrate real payment gateways unless requested.

---

## UI/UX Expectations

Expected quality:

* modern
* premium
* responsive
* smooth animations
* clean spacing
* strong visual hierarchy

Avoid:

* cluttered UI
* inconsistent spacing
* oversized modals
* broken responsive layouts

---

## Important Technical Constraints

Do not break:

* existing route structure
* existing API response format
* Expo configuration
* TailAdmin layout system
* MongoDB relationships
* existing seed flow

---

## Preferred Development Style

* small incremental changes
* reusable components
* reusable hooks/services
* scalable folder structure
* maintainable schema design
