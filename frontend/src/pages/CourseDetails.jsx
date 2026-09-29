import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Clock3, FileQuestion, Plus } from "lucide-react";
import { getCourses, getQuizzesByCourse } from "../api/courses";
import { useAuth } from "../context/AuthContext";
import Loading from "../components/Loading";

export default function CourseDetails() {
  const { courseId } = useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [coursesRes, quizRes] = await Promise.all([
          getCourses(),
          getQuizzesByCourse(courseId)
        ]);
        setCourse(coursesRes.data.find(c => String(c.id) === String(courseId)));
        setQuizzes(quizRes.data);
      } finally { setLoading(false); }
    })();
  }, [courseId]);

  if (loading) return <Loading />;
  const staff = user?.role === "INSTRUCTOR" || user?.role === "ADMIN";

  return (
    <div>
      <Link to="/courses" className="back-link"><ArrowLeft size={16}/> Back to courses</Link>
      <div className="course-header">
        <div className="course-icon large"><FileQuestion size={30}/></div>
        <div><span className="eyebrow">COURSE</span><h2>{course?.title}</h2><p>{course?.description}</p></div>
      </div>

      <div className="section-heading">
        <div><h2>Quizzes</h2><p>Start an assessment when you're ready.</p></div>
      </div>

      <div className="quiz-list">
        {quizzes.map(q => (
          <div className="quiz-card" key={q.id}>
            <div className="quiz-main">
              <div className="quiz-icon"><FileQuestion size={21}/></div>
              <div><h3>{q.title}</h3><p>{q.description || "Assessment quiz"}</p></div>
            </div>
            <div className="quiz-meta">
              <span><Clock3 size={16}/> {q.durationMinutes} min</span>
              <span>{q.totalMarks ?? 0} marks</span>
              {staff
                ? <Link to={`/quiz/${q.id}/manage`} className="btn btn-secondary">Manage</Link>
                : <Link to={`/quiz/${q.id}`} className="btn btn-primary">Start quiz</Link>}
            </div>
          </div>
        ))}
      </div>

      {staff && (
        <div className="staff-action">
          <Plus size={18}/>
          <span>Create a quiz using the backend API, then manage its questions.</span>
        </div>
      )}

      {quizzes.length === 0 && <div className="empty">No quizzes are available for this course.</div>}
    </div>
  );
}