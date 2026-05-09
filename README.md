# BeatCinema - Movie Booking Ecosystem

BeatCinema is a comprehensive, full-stack movie ticket booking system designed for a seamless user experience and powerful administration.

## 🚀 Project Ecosystem

The project is divided into three core components:

1.  **Part 1: Backend (Core API)**
    *   **Tech Stack**: Node.js, Express, MongoDB, Mongoose.
    *   **Standard**: Strict MVC Architecture + Service Layer.
    *   **Key Libraries**: `jsonwebtoken` (Auth), `joi` (Validation), `cookie-parser`, `bcryptjs`.
    *   **API Prefix**: `/api/v1`

2.  **Part 2: Admin Web (Management Dashboard)**
    *   **Tech Stack**: React, TypeScript, Vite, TailAdmin.
    *   **Goal**: Professional management interface with real-time statistics.
    *   **Features**: Movie/Cinema CRUD, Seat Layout Editor, Showtime Management, User/Booking Tracking.

3.  **Part 3: Mobile App (Customer Experience)**
    *   **Tech Stack**: React Native, Expo, TypeScript.
    *   **Libraries**: `expo-secure-store` (Token Storage), `expo-location`, `axios`, `react-native-reanimated`.
    *   **Flow**: Discovery -> Cinema/Showtime Selection -> Interactive Seat Map -> Secure Checkout -> E-Ticket.

---

## 🛠 Tech Stack Summary

| Component | Technology |
| :--- | :--- |
| **Backend** | Node.js, Express, MongoDB, Mongoose |
| **Admin Web** | React, TypeScript, TailAdmin, Vite |
| **Mobile App** | React Native, Expo, TypeScript |
| **Styling** | Tailwind CSS (Admin/Web), Native Styling (Mobile) |
| **Database** | MongoDB Atlas / Local MongoDB |

---

## 🏃 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/Ellie3125/movie-booking-app.git
cd movie-booking-app
```

### 2. Setup Backend
```bash
cd backend
npm install
# Create .env file based on .env.example
npm run dev
```

### 3. Setup Admin Web
```bash
cd admin-web
npm install
npm run dev
```

### 4. Setup Mobile App
```bash
cd mobile-app
npm install
npx expo start
```

---

## 🤖 AI Coding Standards

This project uses **Antigravity** and **Codex** AI agents for development. All AI-related instructions, rules, and skills are maintained in the [`.agents/`](file:///d:/Project_Mobile/movie-booking-app/.agents) directory:
- `RULES.md`: Coding standards and response formats.
- `SKILLS.md`: Specialized AI capabilities.
- `PROJECT_CONTEXT.md`: Deep business and technical context.

---

## 📝 License
This project is for educational/portfolio purposes.
