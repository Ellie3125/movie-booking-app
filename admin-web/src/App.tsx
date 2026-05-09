import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import UserProfiles from "./pages/UserProfiles";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import ShowtimePlanner from "./pages/ShowtimePlanner/ShowtimePlanner";
import { Toaster, toast } from "react-hot-toast";

// Management Pages
import Movies from "./pages/Movies/Movies";
import Cinemas from "./pages/Cinemas/Cinemas";
import Rooms from "./pages/Rooms/Rooms";
import Users from "./pages/Users/Users";
import Showtimes from "./pages/Showtimes/Showtimes";
import Bookings from "./pages/Bookings/Bookings";
import Tickets from "./pages/Tickets/Tickets";
import Payments from "./pages/Payments/Payments";
import SeatLayoutSettingsPage from "./pages/Rooms/SeatLayoutSettings/SeatLayoutSettingsPage";

// New Management Pages
import Admins from "./pages/Users/Admins";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Protected Dashboard Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route index path="/" element={<Home />} />
              <Route path="/profile" element={<UserProfiles />} />
              
              {/* Movie Management */}
              <Route path="/movies" element={<Movies />} />
              
              {/* Cinema Management */}
              <Route path="/cinemas" element={<Cinemas />} />
              <Route path="/rooms" element={<Rooms />} />
              <Route path="/rooms/:roomId/layout" element={<SeatLayoutSettingsPage />} />
              <Route path="/seat-layouts" element={<SeatLayoutSettingsPage />} />

              {/* Showtime Management */}
              <Route path="/showtimes" element={<Showtimes />} />
              <Route path="/showtime-planner" element={<ShowtimePlanner />} />

              {/* Booking Management */}
              <Route path="/bookings" element={<Bookings />} />
              <Route path="/tickets" element={<Tickets />} />
              <Route path="/payments" element={<Payments />} />

              {/* User Management */}
              <Route path="/users" element={<Users />} />
              <Route path="/admins" element={<Admins />} />
            </Route>
          </Route>

          {/* Auth Layout */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
        </Routes>
      </Router>
      <Toaster 
        position="top-right"
        containerStyle={{
          top: 80,
          right: 20,
          zIndex: 99999,
        }}
        toastOptions={{
          duration: 4000,
        }}
      >
        {(t) => (
          <div
            className={`${
              t.visible ? "animate-enter" : "animate-leave"
            } max-w-md w-full pointer-events-auto cursor-pointer`}
            onClick={() => toast.dismiss(t.id)}
          >
            <div className="flex w-full flex-col gap-2">
              {t.type === "success" && (
                <div className="rounded-xl border border-[#12B76A] bg-[#12B76A]/[0.05] p-4 shadow-theme-lg dark:bg-[#12B76A]/[0.08] backdrop-blur-md">
                   <div className="flex items-start gap-3">
                    <div className="mt-0.5 text-[#12B76A]">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 22C6.477 22 2 17.523 2 12C2 6.477 6.477 2 12 2C17.523 2 22 6.477 22 12C22 17.523 17.523 22 12 22ZM12 20C16.418 20 20 16.418 20 12C20 7.582 16.418 4 12 4C7.582 4 4 7.582 4 12C4 16.418 7.582 20 12 20ZM11.003 16L6.76 11.757L8.174 10.343L11.003 13.172L15.833 8.343L17.247 9.757L11.003 16Z" fill="currentColor"/></svg>
                    </div>
                    <div>
                      <h4 className="mb-0.5 text-sm font-bold text-[#12B76A]">Success</h4>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {typeof t.message === "function" ? t.message(t) : t.message}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {t.type === "error" && (
                <div className="rounded-xl border border-[#F04438] bg-[#F04438]/[0.05] p-4 shadow-theme-lg dark:bg-[#F04438]/[0.08] backdrop-blur-md">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 text-[#F04438]">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 22C6.477 22 2 17.523 2 12C2 6.477 6.477 2 12 2C17.523 2 22 6.477 22 12C22 17.523 17.523 22 12 22ZM12 20C16.418 20 20 16.418 20 12C20 7.582 16.418 4 12 4C7.582 4 4 7.582 4 12C4 16.418 7.582 20 12 20ZM11 15H13V17H11V15ZM11 7H13V13H11V7Z" fill="currentColor"/></svg>
                    </div>
                    <div>
                      <h4 className="mb-0.5 text-sm font-bold text-[#F04438]">Error</h4>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {typeof t.message === "function" ? t.message(t) : t.message}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {t.type === "loading" && (
                 <div className="rounded-xl border border-[#465FFF] bg-[#465FFF]/[0.05] p-4 shadow-theme-lg dark:bg-[#465FFF]/[0.08] backdrop-blur-md">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 text-[#465FFF] animate-spin">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 4V2M12 22V20M4 12H2M22 12H20M6.34315 6.34315L4.92893 4.92893M19.0711 19.0711L17.6569 17.6569M6.34315 17.6569L4.92893 19.0711M19.0711 6.34315L17.6569 4.92893" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                    <div>
                      <h4 className="mb-0.5 text-sm font-bold text-[#465FFF]">Loading...</h4>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {typeof t.message === "function" ? t.message(t) : t.message}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </Toaster>
    </AuthProvider>
  );
}

