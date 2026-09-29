import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CheckCircle2, Clock3, Send } from "lucide-react";
import { getQuestions, getQuiz } from "../api/courses";
import { startAttempt, submitAttempt } from "../api/attempts";
import { getApiError } from "../api/axios";
import Loading from "../components/Loading";

export default function Quiz() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [attemptId, setAttemptId] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [quizRes, questionsRes] = await Promise.all([
          getQuiz(quizId),
          getQuestions(quizId)
        ]);
        setQuiz(quizRes.data);
        setQuestions(questionsRes.data);
        const attemptRes = await startAttempt(quizId);
        setAttemptId(attemptRes.data.attemptId);
        setSecondsLeft((quizRes.data.durationMinutes || 30) * 60);
      } catch (e) {
        setError(getApiError(e));
      } finally {
        setLoading(false);
      }
    })();
  }, [quizId]);

  useEffect(() => {
    if (secondsLeft == null || submitting) return;
    if (secondsLeft <= 0) {
      handleSubmit(true);
      return;
    }
    const timer = setInterval(() => setSecondsLeft(s => s - 1), 1000);
    return () => clearInterval(timer);
  }, [secondsLeft, submitting]);

  const formattedTime = useMemo(() => {
    if (secondsLeft == null) return "--:--";
    const m = Math.floor(secondsLeft / 60).toString().padStart(2, "0");
    const s = (secondsLeft % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }, [secondsLeft]);

  const choose = (questionId, optionId) =>
    setAnswers(prev => ({ ...prev, [questionId]: optionId }));

  async function handleSubmit(auto = false) {
    if (submitting || !attemptId) return;
    if (!auto && !window.confirm("Submit your quiz now? You cannot retake it after submission.")) return;

    setSubmitting(true);
    try {
      const payload = Object.entries(answers).map(([questionId, optionId]) => ({
        questionId: Number(questionId),
        optionId: Number(optionId)
      }));
      const { data } = await submitAttempt(attemptId, payload);
      navigate(`/result/${data.resultId}`, { replace: true });
    } catch (e) {
      setError(getApiError(e));
      setSubmitting(false);
    }
  }

  if (loading) return <Loading text="Preparing your quiz..." />;
  if (error) return <div className="error-box"><strong>Quiz unavailable</strong><span>{error}</span></div>;

  return (
    <div className="quiz-page">
      <div className="quiz-top">
        <div><span className="eyebrow">ASSESSMENT</span><h2>{quiz.title}</h2><p>{quiz.description}</p></div>
        <div className={`timer ${secondsLeft < 60 ? "danger" : ""}`}><Clock3 size={19}/>{formattedTime}</div>
      </div>

      <div className="quiz-progress">
        <span>{Object.keys(answers).length} / {questions.length} answered</span>
        <div><i style={{ width: `${questions.length ? Object.keys(answers).length / questions.length * 100 : 0}%` }}/></div>
      </div>

      <div className="question-list">
        {questions.map((q, index) => (
          <div className="question-card" key={q.id}>
            <div className="question-number">Q{index + 1}</div>
            <div className="question-body">
              <div className="question-title">{q.questionText}</div>
              <span className="marks">{q.marks} mark{q.marks === 1 ? "" : "s"}</span>
              <div className="options">
                {(q.options || []).map(option => (
                  <label className={`option ${answers[q.id] === option.id ? "selected" : ""}`} key={option.id}>
                    <input
                      type="radio"
                      name={`q-${q.id}`}
                      checked={answers[q.id] === option.id}
                      onChange={() => choose(q.id, option.id)}
                    />
                    <span>{option.optionText}</span>
                    {answers[q.id] === option.id && <CheckCircle2 size={18}/>}
                  </label>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="submit-bar">
        <span>{questions.length - Object.keys(answers).length} question(s) unanswered</span>
        <button className="btn btn-primary" onClick={() => handleSubmit(false)} disabled={submitting}>
          <Send size={17}/>{submitting ? "Submitting..." : "Submit Quiz"}
        </button>
      </div>
    </div>
  );
}