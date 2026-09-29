import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createCourse } from "../api/courses";
import { getApiError } from "../api/axios";

export default function CreateCourse() {
  const [form, setForm] = useState({ title: "", description: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const submit = async e => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const { data } = await createCourse(form);
      navigate(`/courses/${data.id}`);
    } catch (e) {
      setError(getApiError(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="form-page">
      <div className="page-title"><span className="eyebrow">INSTRUCTOR / ADMIN</span><h2>Create Course</h2><p>Add a new course to the LMS.</p></div>
      <form className="panel form" onSubmit={submit}>
        <label>Course title<input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="e.g. Cyber Security Fundamentals"/></label>
        <label>Description<textarea rows="5" value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Describe the course..."/></label>
        {error && <div className="form-error">{error}</div>}
        <button className="btn btn-primary" disabled={saving}>{saving ? "Creating..." : "Create course"}</button>
      </form>
    </div>
  );
}