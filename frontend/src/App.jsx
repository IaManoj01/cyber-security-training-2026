import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Courses from "./pages/Courses";
import CourseDetails from "./pages/CourseDetails";
import Quiz from "./pages/Quiz";
import Result from "./pages/Result";
import ManageQuiz from "./pages/ManageQuiz";
import CreateCourse from "./pages/CreateCourse";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:courseId" element={<CourseDetails />} />
          <Route path="/quiz/:quizId" element={<Quiz />} />
          <Route path="/result/:resultId" element={<Result />} />

          <Route element={<ProtectedRoute roles={["INSTRUCTOR", "ADMIN"]} />}>
            <Route path="/courses/create" element={<CreateCourse />} />
            <Route path="/quiz/:quizId/manage" element={<ManageQuiz />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}