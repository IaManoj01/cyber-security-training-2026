import { useEffect, useState } from "react";
import { BookOpen, ClipboardCheck, PlusCircle, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { getCourses, getQuizzesByCourse } from "../api/courses";
import { useAuth } from "../context/AuthContext";
import Loading from "../components/Loading";

export default function Dashboard() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [quizCount, setQuizCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await getCourses();
        setCourses(data);
        const lists = await Promise.all(data.map(c => getQuizzesByCourse(c.id)));
        setQuizCount(lists.reduce((sum, r) => sum + r.data.length, 0));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <Loading />;

  const staff = user?.role === "INSTRUCTOR" || user?.role === "ADMIN";

  return (
    <div>
      <div className="hero">
        <div>
          <span className="eyebrow">DASHBOARD</span>
          <h2>Hello, {user?.username} 👋</h2>
          <p>Access your courses and complete assessments from one place.</p>
        </div>
        {staff && (
          <Link to="/courses/create" className="btn btn-light"><PlusCircle size={18}/> New Course</Link>
        )}
      </div>

      <div className="stats-grid">
        <Stat icon={<BookOpen/>} label="Courses" value={courses.length}/>
        <Stat icon={<ClipboardCheck/>} label="Quizzes" value={quizCount}/>
        <Stat icon={<Users/>} label="Role" value={user?.role}/>
      </div>

      <div className="section-heading">
        <div><h2>Available courses</h2><p>Choose a course to view its quizzes.</p></div>
        <Link to="/courses" className="text-link">View all →</Link>
      </div>

      <div className="course-grid">
        {courses.slice(0, 6).map(course => (
          <Link className="course-card" to={`/courses/${course.id}`} key={course.id}>
            <div className="course-icon"><BookOpen size={22}/></div>
            <h3>{course.title}</h3>
            <p>{course.description || "Explore this course and its assessments."}</p>
            <span>Open course →</span>
          </Link>
        ))}
      </div>

      {courses.length === 0 && <div className="empty">No courses have been created yet.</div>}
    </div>
  );
}

function Stat({ icon, label, value }) {
  return <div className="stat-card"><div className="stat-icon">{icon}</div><div><span>{label}</span><strong>{value}</strong></div></div>;
}