import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Plus } from "lucide-react";
import { getCourses } from "../api/courses";
import { useAuth } from "../context/AuthContext";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";

export default function Courses() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    try { setCourses((await getCourses()).data); }
    catch (e) { setError(e?.response?.data?.message || "Could not load courses."); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <Loading />;
  const staff = user?.role === "INSTRUCTOR" || user?.role === "ADMIN";

  return (
    <div>
      <div className="page-title-row">
        <div><span className="eyebrow">LEARNING</span><h2>Courses</h2><p>Browse all available courses.</p></div>
        {staff && <Link to="/courses/create" className="btn btn-primary"><Plus size={18}/> Create Course</Link>}
      </div>
      <ErrorMessage message={error} onRetry={load}/>
      <div className="course-grid">
        {courses.map(course => (
          <Link className="course-card" to={`/courses/${course.id}`} key={course.id}>
            <div className="course-icon"><BookOpen size={22}/></div>
            <h3>{course.title}</h3>
            <p>{course.description || "No description available."}</p>
            <span>View quizzes →</span>
          </Link>
        ))}
      </div>
      {courses.length === 0 && <div className="empty">No courses found.</div>}
    </div>
  );
}