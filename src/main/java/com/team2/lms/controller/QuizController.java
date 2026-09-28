package com.team2.lms.controller;

import com.team2.lms.dto.QuizDtos.*;
import com.team2.lms.entity.*;
import com.team2.lms.repository.*;
import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class QuizController {
    private final QuizRepository quizzes;
    private final CourseRepository courses;
    private final UserRepository users;
    private final QuestionRepository questions;
    private final QuestionOptionRepository options;

    public QuizController(QuizRepository quizzes, CourseRepository courses, UserRepository users,
                          QuestionRepository questions, QuestionOptionRepository options) {
        this.quizzes = quizzes; this.courses = courses; this.users = users;
        this.questions = questions; this.options = options;
    }

    @PostMapping("/quizzes")
    @PreAuthorize("hasAnyRole('INSTRUCTOR','ADMIN')")
    public ResponseEntity<QuizResponse> createQuiz(@Valid @RequestBody QuizRequest request,
                                                     Authentication auth) {
        Course course = courses.findById(request.courseId())
                .orElseThrow(() -> new RuntimeException("Course not found"));
        User creator = users.findByUsername(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Quiz quiz = Quiz.builder().title(request.title()).description(request.description())
                .durationMinutes(request.durationMinutes()).totalMarks(0)
                .course(course).createdBy(creator).build();
        quiz = quizzes.save(quiz);
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(quiz));
    }

    @GetMapping("/quizzes/{id}")
    public QuizResponse getQuiz(@PathVariable Long id) {
        return toResponse(quizzes.findById(id).orElseThrow(() -> new RuntimeException("Quiz not found")));
    }

    @GetMapping("/courses/{courseId}/quizzes")
    public List<QuizResponse> getByCourse(@PathVariable Long courseId) {
        return quizzes.findByCourseId(courseId).stream().map(this::toResponse).toList();
    }

    @PostMapping("/quizzes/{quizId}/questions")
    @PreAuthorize("hasAnyRole('INSTRUCTOR','ADMIN')")
    public ResponseEntity<?> addQuestion(@PathVariable Long quizId,
                                         @Valid @RequestBody QuestionRequest request) {
        Quiz quiz = quizzes.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Quiz not found"));

        Question question = Question.builder()
                .questionText(request.questionText()).marks(request.marks()).quiz(quiz).build();
        question = questions.save(question);

        for (var optionRequest : request.options()) {
            options.save(QuestionOption.builder()
                    .optionText(optionRequest.optionText())
                    .correct(optionRequest.correct())
                    .question(question).build());
        }

        quiz.setTotalMarks((quiz.getTotalMarks() == null ? 0 : quiz.getTotalMarks()) + request.marks());
        quizzes.save(quiz);

        return ResponseEntity.status(HttpStatus.CREATED).body("Question added successfully");
    }

    @GetMapping("/quizzes/{quizId}/questions")
    public List<Question> getQuestions(@PathVariable Long quizId) {
        return questions.findByQuizId(quizId);
    }

    private QuizResponse toResponse(Quiz q) {
        return new QuizResponse(q.getId(), q.getTitle(), q.getDescription(),
                q.getDurationMinutes(), q.getTotalMarks(), q.getCourse().getId());
    }
}
