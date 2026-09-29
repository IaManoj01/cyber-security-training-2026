import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  BookOpen,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  PlusCircle,
  ShieldCheck
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const signOut = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const isStaff = user?.role === "INSTRUCTOR" || user?.role === "ADMIN";

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon"><ShieldCheck size={22} /></div>
          <div>
            <strong>Team 2 LMS</strong>
            <span>Quiz & Assessment</span>
          </div>
        </div>

        <nav className="nav">
          <NavLink to="/" end className="nav-link">
            <LayoutDashboard size={18} /> Dashboard
          </NavLink>
          <NavLink to="/courses" className="nav-link">
            <BookOpen size={18} /> Courses
          </NavLink>
          {isStaff && (
            <NavLink to="/courses/create" className="nav-link">
              <PlusCircle size={18} /> Create Course
            </NavLink>
          )}
        </nav>

        <div className="sidebar-bottom">
          <div className="user-mini">
            <div className="avatar">{user?.username?.charAt(0)?.toUpperCase()}</div>
            <div>
              <strong>{user?.username}</strong>
              <span>{user?.role}</span>
            </div>
          </div>
          <button className="logout-btn" onClick={signOut}>
            <LogOut size={17} /> Logout
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <span className="eyebrow">LEARNING MANAGEMENT SYSTEM</span>
            <h1>Online Quiz & Assessment</h1>
          </div>
          <div className="topbar-role">
            <GraduationCap size={18} />
            {user?.role}
          </div>
        </header>
        <section className="page-content">
          <Outlet />
        </section>
      </main>
    </div>
  );
}