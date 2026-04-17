import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ErrorBanner from "../../components/ErrorBanner";
import { useAuthStore } from "../../store/authStore";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, loading, error } = useAuthStore();
  const [form, setForm] = useState({ email: "", password: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = await login(form);
    navigate(user.role === "admin" ? "/admin/events" : "/events");
  };

  return (
    <div className="auth-wrap">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Welcome back</h1>
        <p className="subtle">Login to book tickets, track bookings, and manage your wallet.</p>
        <ErrorBanner message={error} />
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
          {loading ? "Logging in..." : "Login"}
        </button>
        <p>
          New here? <Link to="/register">Create an account</Link>
        </p>
        <p>
          Admin? <Link to="/admin/login">Use admin login</Link>
        </p>
      </form>
    </div>
  );
};

export default LoginPage;
