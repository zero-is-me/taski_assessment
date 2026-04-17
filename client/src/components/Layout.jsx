import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link to={user?.role === "admin" ? "/admin/events" : "/events"} className="brand">
          taSki
        </Link>
        <nav className="nav">
          {user?.role !== "admin" && (
            <>
              <Link to="/events">Events</Link>
              <Link to="/wallet">Wallet</Link>
              <Link to="/bookings">Bookings</Link>
            </>
          )}
          {user?.role === "admin" && (
            <>
              <Link to="/admin/events">Admin Events</Link>
              <Link to="/admin/bookings">Admin Bookings</Link>
              <Link to="/admin/transactions">Transactions</Link>
            </>
          )}
          {user ? (
            <button
              type="button"
              onClick={() => {
                logout();
                navigate("/login");
              }}
            >
              Logout
            </button>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </nav>
      </header>
      <main className="page">{children}</main>
    </div>
  );
};

export default Layout;
