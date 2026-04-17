import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ErrorBanner from "../../components/ErrorBanner";
import { useAuthStore } from "../../store/authStore";

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const { login, loading, error, logout } = useAuthStore();
  const [form, setForm] = useState({ email: "", password: "" });
  const [localError, setLocalError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");
    const user = await login(form);

    if (user.role !== "admin") {
      logout();
      setLocalError("This account is not an admin");
      return;
    }

    navigate("/admin/events");
  };

  return (
    <div className="auth-wrap">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Admin login</h1>
        <p className="subtle">Use an admin account to manage events, bookings, and refunds.</p>
        <ErrorBanner message={localError || error} />
        <div className="field">
          <label>Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </div>
        <div className="field">
          <label>Password</label>
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
        </div>
        <button className="btn" disabled={loading}>
          {loading ? "Checking..." : "Login as admin"}
        </button>
      </form>
    </div>
  );
};

export default AdminLoginPage;
