import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/Login/LoginPage";
import RegisterPage from "./pages/Register/RegisterPage";
import WalletPage from "./pages/Wallet/WalletPage";
import EventsPage from "./pages/Events/EventsPage";
import SeatsPage from "./pages/Seats/SeatsPage";
import BookingsPage from "./pages/Bookings/BookingsPage";
import BookingDetailPage from "./pages/BookingDetail/BookingDetailPage";
import AdminLoginPage from "./pages/AdminLogin/AdminLoginPage";
import AdminEventsPage from "./pages/AdminEvents/AdminEventsPage";
import AdminSeatsPage from "./pages/AdminSeats/AdminSeatsPage";
import AdminBookingsPage from "./pages/AdminBookings/AdminBookingsPage";
import AdminTransactionsPage from "./pages/AdminTransactions/AdminTransactionsPage";
import { useAuthStore } from "./store/authStore";

const App = () => {
  const refreshMe = useAuthStore((state) => state.refreshMe);

  useEffect(() => {
    refreshMe();
  }, [refreshMe]);

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/events" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />

        <Route
          path="/wallet"
          element={
            <ProtectedRoute>
              <WalletPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/events"
          element={
            <ProtectedRoute>
              <EventsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/events/:id/seats"
          element={
            <ProtectedRoute>
              <SeatsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bookings"
          element={
            <ProtectedRoute>
              <BookingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/booking/:id"
          element={
            <ProtectedRoute>
              <BookingDetailPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/events"
          element={
            <ProtectedRoute adminOnly>
              <AdminEventsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/events/:id/seats"
          element={
            <ProtectedRoute adminOnly>
              <AdminSeatsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/bookings"
          element={
            <ProtectedRoute adminOnly>
              <AdminBookingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/transactions"
          element={
            <ProtectedRoute adminOnly>
              <AdminTransactionsPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Layout>
  );
};

export default App;
