import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { register } from "../api/auth";
import { getApiError } from "../api/axios";

export default function Register() {
  const [form, setForm] = useState({ username: "", password: "", role: "STUDENT" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const { data } = await register(form);
      setMessage(typeof data === "string" ? data : "Registration successful.");
      setTimeout(() => navigate("/login"), 700);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo"><ShieldCheck size={28} /></div>
        <h1>Create account</h1>
        <p>Register for the Team 2 LMS.</p>
        <form onSubmit={submit} className="form">
          <label>Username<input required value={form.username} onChange={(e) => setForm({...form, username: e.target.value})} /></label>
          <label>Password<input required minLength={6} type="password" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} /></label>
          <label>Role
            <select value={form.role} onChange={(e) => setForm({...form, role: e.target.value})}>
              <option value="STUDENT">Student</option>
              <option value="INSTRUCTOR">Instructor</option>
              <option value="ADMIN">Admin</option>
            </select>
          </label>
          {error && <div className="form-error">{error}</div>}
          {message && <div className="success-box">{message}</div>}
          <button className="btn btn-primary btn-full" disabled={loading}>
            {loading ? "Creating..." : "Create account"}
          </button>
          <p className="form-footer">Already registered? <Link to="/login">Sign in</Link></p>
        </form>
      </div>
    </div>
  );
}