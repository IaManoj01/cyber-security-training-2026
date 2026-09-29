import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Plus, CheckCircle2 } from "lucide-react";
import { addQuestion, getQuestions, getQuiz } from "../api/courses";
import { getApiError } from "../api/axios";
import Loading from "../components/Loading";

const blankOptions = () => [
  { optionText: "", correct: true },
  { optionText: "", correct: false },
  { optionText: "", correct: false },
  { optionText: "", correct: false }
];

export default function ManageQuiz() {
  const { quizId } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [form, setForm] = useState({ questionText: "", marks: 1, options: blankOptions() });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const [q, qs] = await Promise.all([getQuiz(quizId), getQuestions(quizId)]);
      setQuiz(q.data);
      setQuestions(qs.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [quizId]);

  const setOption = (index, key, value) => {
    setForm(prev => ({
      ...prev,
      options: prev.options.map((o, i) =>
        i === index ? { ...o, [key]: value } : key === "correct" && value ? { ...o, correct: false } : o
      )
    }));
  };

  const submit = async e => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await addQuestion(quizId, {
        questionText: form.questionText,
        marks: Number(form.marks),
        options: form.options
      });
      setForm({ questionText: "", marks: 1, options: blankOptions() });
      await load();
    } catch (e) {
      setError(getApiError(e));
    } finally { setSaving(false); }
  };

  if (loading) return <Loading />;
  return (
    <div>
      <Link to="/courses" className="back-link"><ArrowLeft size={16}/> Courses</Link>
      <div className="page-title"><span className="eyebrow">QUIZ MANAGEMENT</span><h2>{quiz?.title}</h2><p>{quiz?.description}</p></div>

      <div className="manage-grid">
        <form className="panel form" onSubmit={submit}>
          <h3>Add MCQ question</h3>
          <label>Question<textarea required rows="4" value={form.questionText} onChange={e => setForm({...form, questionText: e.target.value})}/></label>
          <label>Marks<input type="number" min="1" required value={form.marks} onChange={e => setForm({...form, marks: e.target.value})}/></label>
          <div className="options-editor">
            {form.options.map((option, i) => (
              <div className="editor-option" key={i}>
                <input required placeholder={`Option ${i + 1}`} value={option.optionText} onChange={e => setOption(i, "optionText", e.target.value)}/>
                <label className="check-label"><input type="radio" name="correct" checked={option.correct} onChange={() => setOption(i, "correct", true)}/> Correct</label>
              </div>
            ))}
          </div>
          {error && <div className="form-error">{error}</div>}
          <button className="btn btn-primary" disabled={saving}><Plus size={17}/>{saving ? "Adding..." : "Add question"}</button>
        </form>

        <div>
          <div className="section-heading compact"><div><h3>Questions ({questions.length})</h3><p>Questions already added to this quiz.</p></div></div>
          <div className="question-admin-list">
            {questions.map((q, i) => (
              <div className="admin-question" key={q.id}>
                <span>Q{i + 1}</span><div><strong>{q.questionText}</strong><small>{q.marks} marks</small></div><CheckCircle2 size={18}/>
              </div>
            ))}
            {questions.length === 0 && <div className="empty">No questions yet.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}