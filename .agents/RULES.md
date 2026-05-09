# RULES.md - Project Standards

## 1. Global Rules

*   **Architecture Integrity**: Do not generate random architecture. Reuse existing patterns.
*   **Minimal Changes**: Avoid massive refactors. Keep naming consistent.
*   **No Placeholders**: Never leave `TODO` or placeholder code.
*   **Verification**: Always verify build, lint, and runtime before finishing.
*   **Modification Flow**: Read related files -> Understand structure -> Reuse patterns -> Explain changes.

---

## 2. Backend (Node.js + Express + MongoDB)

*   **Libraries**: Use `jsonwebtoken` for tokens, `cookie-parser` for cookies, and `joi` for validation.
*   **Architecture**: Strict MVC + Service Layer.
*   **Thin Controllers**: Controllers only handle req/res and call services.
*   **Service Layer**: All business logic and DB operations must reside here.
*   **Models**: Clean Mongoose schemas. No complex logic.
*   **Responses**: Use the standard `Success` and `Error` formats (see below).
*   **Validation**: Always validate request body/params (e.g., using a validation middleware).
*   **Security**: Never expose sensitive data (passwords, etc.).
*   **Async**: Use `asyncHandler` for all async routes to ensure proper error forwarding.

---

## 3. Admin Web (React + TypeScript + TailAdmin)

*   **Libraries**: Use `axios` for API calls, `dayjs` for dates, and `localStorage` for token storage.
*   **Token Storage**: Must follow the pattern in `src/api/axios.ts` using `localStorage.getItem('accessToken')`.
*   **Tech Stack**: React components with strong TypeScript typing.
*   **UI System**: Use TailAdmin components and layout system.
*   **Typing**: Define Interfaces/Types for all API responses and component props.
*   **State Management**: Use hooks (useState, useEffect, custom hooks) effectively.
*   **Reusability**: Create reusable Table, Form, and Modal components.
*   **Design**: Maintain professional, dashboard-style aesthetics (premium dark/light modes).

---

## 4. Mobile App (React Native + Expo)

*   **Libraries**: Use `expo-secure-store` for tokens, `expo-location` for location, and `axios` for API.
*   **Token Storage**: Must use `lib/tokenStorage.ts` (wraps `expo-secure-store`).
*   **Location**: Always use `expo-location` for retrieving user position.
*   **Tech Stack**: React Native components managed via Expo.
*   **Navigation**: Maintain a smooth, intuitive booking flow.
*   **Performance**: Optimize seat map rendering. Avoid heavy re-renders.
*   **UI/UX**: Ensure touch targets are accessible (>= 44px).
*   **Responsiveness**: Layouts must work across various screen sizes (iOS/Android).
*   **Transitions**: Use subtle animations for screen transitions and interactions.

---

## Standard Response Format

### Success
```json
{
  "success": true,
  "message": "Action completed successfully",
  "data": { ... }
}
```

### Error
```json
{
  "success": false,
  "message": "User-friendly error message",
  "error": "Internal error details (dev mode only)"
}
```

---

## AI Generation Workflow

1.  **Analyze**: Understand requirements and check current code.
2.  **Plan**: Identify affected files and explain the approach.
3.  **Implement**: Write clean, consistent, and commented code.
4.  **Explain**: Detail the changes and how the logic flows.
5.  **Verify**: Provide a checklist for testing and mention risks.
