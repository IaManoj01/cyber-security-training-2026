import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Award, ArrowLeft, CheckCircle2 } from "lucide-react";
import { getResult } from "../api/attempts";
import Loading from "../components/Loading";
import { getApiError } from "../api/axios";

export default function Result() {
  const { resultId } = useParams();
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getResult(resultId)
      .then(res => setResult(res.data))
      .catch(err => setError(getApiError(err)));
  }, [resultId]);

  if (error) return <div className="error-box"><strong>Could not load result</strong><span>{error}</span></div>;
  if (!result) return <Loading />;

  return (
    <div className="result-page">
      <div className="result-card">
        <div className="result-icon"><Award size={40}/></div>
        <span className="eyebrow">ASSESSMENT COMPLETE</span>
        <h2>Quiz Result</h2>
        <p>Your result has been generated successfully.</p>
        <div className="score">{Number(result.percentage).toFixed(1)}<small>%</small></div>
        <div className="score-line"><strong>{result.score}</strong> / {result.totalMarks} marks</div>
        <div className="result-status"><CheckCircle2 size={18}/> Submitted successfully</div>
        <div className="result-actions">
          <Link to="/" className="btn btn-primary">Go to dashboard</Link>
          <Link to="/courses" className="btn btn-secondary"><ArrowLeft size={16}/> Courses</Link>
        </div>
      </div>
    </div>
  );
}