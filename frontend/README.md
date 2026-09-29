# Team 2 LMS React Frontend

React + Vite frontend for the provided Spring Boot LMS Quiz & Assessment backend.

## Requirements

- Node.js 18+
- Spring Boot backend running on `http://localhost:8080`
- MySQL configured for the backend

## Run

```bash
npm install
npm run dev
```

Open:

http://localhost:5173

Vite proxies `/api` requests to `http://localhost:8080`.

## Backend APIs used

- POST `/api/auth/register`
- POST `/api/auth/login`
- GET `/api/courses`
- POST `/api/courses`
- GET `/api/courses/{courseId}/quizzes`
- GET `/api/quizzes/{id}`
- POST `/api/quizzes`
- GET `/api/quizzes/{quizId}/questions`
- POST `/api/quizzes/{quizId}/questions`
- POST `/api/quizzes/{quizId}/attempts`
- POST `/api/attempts/{attemptId}/submit`
- GET `/api/results/{id}`

## Important backend change

The current `Question` entity does not expose its `QuestionOption` records through
`GET /api/quizzes/{quizId}/questions`. The student quiz page therefore needs a
question DTO that includes options, or a relationship from Question to QuestionOption.

See `BACKEND_FIX.md` in this frontend package for the exact recommended fix.
