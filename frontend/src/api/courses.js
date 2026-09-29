import api from "./axios";

export const getCourses = () => api.get("/courses");
export const createCourse = (data) => api.post("/courses", data);
export const getQuizzesByCourse = (courseId) =>
  api.get(`/courses/${courseId}/quizzes`);
export const getQuiz = (quizId) => api.get(`/quizzes/${quizId}`);
export const getQuestions = (quizId) =>
  api.get(`/quizzes/${quizId}/questions`);
export const createQuiz = (data) => api.post("/quizzes", data);
export const addQuestion = (quizId, data) =>
  api.post(`/quizzes/${quizId}/questions`, data);