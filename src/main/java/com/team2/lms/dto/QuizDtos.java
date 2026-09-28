package com.team2.lms.dto;

import jakarta.validation.constraints.*;
import java.util.List;

public class QuizDtos {
    public record QuizRequest(
            @NotBlank String title,
            String description,
            @NotNull Long courseId,
            @NotNull @Min(1) Integer durationMinutes) {}

    public record QuizResponse(
            Long id, String title, String description,
            Integer durationMinutes, Integer totalMarks, Long courseId) {}

    public record QuestionRequest(
            @NotBlank String questionText,
            @NotNull @Min(1) Integer marks,
            @NotEmpty List<OptionRequest> options) {}

    public record OptionRequest(
            @NotBlank String optionText,
            boolean correct) {}

    public record AttemptResponse(
            Long attemptId, Long quizId, String status) {}

    public record AnswerRequest(
            Long questionId, Long optionId) {}

    public record SubmitAttemptRequest(
            @NotEmpty List<AnswerRequest> answers) {}

    public record ResultResponse(
            Long resultId, Long attemptId, Integer score,
            Integer totalMarks, Double percentage) {}
}
