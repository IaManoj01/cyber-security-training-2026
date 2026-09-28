package com.team2.lms.controller;

import com.team2.lms.dto.QuizDtos.*;
import com.team2.lms.entity.*;
import com.team2.lms.repository.*;
import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api")
public class AttemptController {
    private final QuizRepository quizzes;
    private final UserRepository users;
    private final QuizAttemptRepository attempts;
    private final QuizAnswerRepository answers;
    private final QuestionRepository questions;
    private final QuestionOptionRepository options;
    private final ResultRepository results;

    public AttemptController(QuizRepository quizzes, UserRepository users, QuizAttemptRepository attempts,
                             QuizAnswerRepository answers, QuestionRepository questions,
                             QuestionOptionRepository options, ResultRepository results) {
        this.quizzes = quizzes; this.users = users; this.attempts = attempts; this.answers = answers;
        this.questions = questions; this.options = options; this.results = results;
    }

    @PostMapping("/quizzes/{quizId}/attempts")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<AttemptResponse> start(@PathVariable Long quizId, Authentication auth) {
        Quiz quiz = quizzes.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Quiz not found"));
        User student = users.findByUsername(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (attempts.existsByQuizIdAndStudentIdAndStatus(quizId, student.getId(), QuizAttempt.Status.SUBMITTED))
            throw new RuntimeException("Quiz already submitted by this student");

        QuizAttempt attempt = QuizAttempt.builder().quiz(quiz).student(student)
                .startedAt(LocalDateTime.now()).status(QuizAttempt.Status.IN_PROGRESS).score(0).build();
        attempt = attempts.save(attempt);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new AttemptResponse(attempt.getId(), quizId, attempt.getStatus().name()));
    }

    @PostMapping("/attempts/{attemptId}/submit")
    @PreAuthorize("hasRole('STUDENT')")
    public ResultResponse submit(@PathVariable Long attemptId,
                                 @Valid @RequestBody SubmitAttemptRequest request,
                                 Authentication auth) {
        QuizAttempt attempt = attempts.findById(attemptId)
                .orElseThrow(() -> new RuntimeException("Attempt not found"));

        if (!attempt.getStudent().getUsername().equals(auth.getName()))
            throw new RuntimeException("You cannot submit another student's attempt");

        if (attempt.getStatus() == QuizAttempt.Status.SUBMITTED)
            throw new RuntimeException("Attempt already submitted");

        int score = 0;
        for (AnswerRequest ar : request.answers()) {
            Question q = questions.findById(ar.questionId())
                    .orElseThrow(() -> new RuntimeException("Question not found"));
            QuestionOption selected = options.findById(ar.optionId())
                    .orElseThrow(() -> new RuntimeException("Option not found"));

            boolean correct = selected.isCorrect() && selected.getQuestion().getId().equals(q.getId());
            if (correct) score += q.getMarks();

            answers.save(QuizAnswer.builder().attempt(attempt).question(q)
                    .selectedOption(selected).correct(correct).build());
        }

        attempt.setScore(score);
        attempt.setStatus(QuizAttempt.Status.SUBMITTED);
        attempt.setSubmittedAt(LocalDateTime.now());
        attempts.save(attempt);

        int total = attempt.getQuiz().getTotalMarks() == null ? 0 : attempt.getQuiz().getTotalMarks();
        double percentage = total == 0 ? 0 : (score * 100.0) / total;

        Result result = results.save(Result.builder().attempt(attempt).score(score)
                .totalMarks(total).percentage(percentage).generatedAt(LocalDateTime.now()).build());

        return new ResultResponse(result.getId(), attemptId, score, total, percentage);
    }

    @GetMapping("/results/{id}")
    public ResultResponse getResult(@PathVariable Long id, Authentication auth) {
        Result result = results.findById(id)
                .orElseThrow(() -> new RuntimeException("Result not found"));

        if (!result.getAttempt().getStudent().getUsername().equals(auth.getName())
                && !auth.getAuthorities().stream().anyMatch(a ->
                    a.getAuthority().equals("ROLE_INSTRUCTOR") || a.getAuthority().equals("ROLE_ADMIN"))) {
            throw new RuntimeException("Access denied");
        }

        return new ResultResponse(result.getId(), result.getAttempt().getId(),
                result.getScore(), result.getTotalMarks(), result.getPercentage());
    }
}
