# SKILL: BACKEND CORE ARCHITECTURE

This skill defines the foundational structure and standards for the Node.js + Express + MongoDB backend of the Movie Booking App.

## Purpose
Enforce a clean, maintainable MVC architecture, standardized bootstrap processes, and consistent layer responsibilities.

---

## 1. Project Structure
Priority is given to a minimalist, clear MVC structure:
```txt
backend/
  src/
    config/      # Environment and DB configs
    controllers/ # Request handling
    middlewares/ # Global and local middlewares
    models/      # Mongoose schemas
    routes/      # Endpoint definitions
    services/    # Business logic
    utils/       # Shared utilities
    app.js       # App configuration
    server.js    # Server entry point
```

---

## 2. Bootstrapping

### App Bootstrap (`app.js`)
- **Responsibility**: Express configuration and middleware mounting.
- **Rules**:
    - Create express app, use `express.json()`, `cors()`.
    - Mount routes and standard error/notFound middlewares.
    - **Export** the app.
    - **Do NOT**: listen on ports, connect to DB, or include business logic.

### Server Bootstrap (`server.js`)
- **Responsibility**: Environment loading, DB connection, and starting the listener.
- **Rules**:
    - Load `.env` using `dotenv`.
    - Import `app` and `connectDB`.
    - Start the listener on the specified port.
    - **Do NOT**: define routes, controllers, or middlewares.

---

## 3. Layer Responsibilities

### Models (Mongoose)
- **Rules**: 
    - Define fields clearly with proper types and enums.
    - Use `ref` for relations.
    - Keep logic minimal (hooks/indexes).
    - **Do NOT**: contain business or API logic.

### Services
- **Rules**:
    - Handle all business logic and DB operations.
    - Return data to controllers.
    - **Do NOT**: return HTTP responses or use `req`/`res`.

### Controllers
- **Rules**:
    - Read request params/body.
    - Call the appropriate service.
    - Return standardized JSON responses.
    - **Do NOT**: contain complex logic or direct DB queries.

### Routes
- **Rules**:
    - Define endpoints and HTTP methods.
    - Apply middlewares (auth, validation).
    - Map to controller functions.
    - **Do NOT**: contain any processing logic.

---

## 4. Middleware & Utilities

### Standard Middlewares
- `error.middleware.js`: Standardized error response (no stack in production).
- `notFound.middleware.js`: Handle 404s and forward to error handler.
- `asyncHandler`: Utility to wrap async functions and catch errors automatically.

### Configuration
- `config/env.js`: Centralized environment variable reading.
- `config/db.js`: MongoDB connection logic using Mongoose.

---

## 5. Verification Checklist
- [ ] Logic is in Service, not Controller.
- [ ] No DB queries in Controller or Route.
- [ ] Models are clean schemas.
- [ ] Response matches the standard format.
- [ ] `app.js` and `server.js` are properly separated.
- [ ] Error handling uses `asyncHandler` and global middleware.
