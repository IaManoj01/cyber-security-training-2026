import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ShieldCheck, Eye, EyeOff } from "lucide-react";
import { login } from "../api/auth";
import { getApiError } from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { saveAuth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await login(form);
      saveAuth(data);
      const target = location.state?.from?.pathname || "/";
      navigate(target, { replace: true });
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthPage title="Welcome back" subtitle="Sign in to continue learning.">
      <form onSubmit={submit} className="form">
        <label>Username<input required value={form.username} onChange={(e) => setForm({...form, username: e.target.value})} /></label>
        <label>Password
          <div className="password-wrap">
            <input required type={showPassword ? "text" : "password"} value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} />
            <button type="button" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}</button>
          </div>
        </label>
        {error && <div className="form-error">{error}</div>}
        <button className="btn btn-primary btn-full" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </button>
        <p className="form-footer">Don't have an account? <Link to="/register">Create one</Link></p>
      </form>
    </AuthPage>
  );
}

function AuthPage({ title, subtitle, children }) {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo"><ShieldCheck size={28} /></div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
        {children}
      </div>
    </div>
  );
}