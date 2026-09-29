import api from "./axios";

export const startAttempt = (quizId) =>
  api.post(`/quizzes/${quizId}/attempts`);

export const submitAttempt = (attemptId, answers) =>
  api.post(`/attempts/${attemptId}/submit`, { answers });

export const getResult = (resultId) => api.get(`/results/${resultId}`);