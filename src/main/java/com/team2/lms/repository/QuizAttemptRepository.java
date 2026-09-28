package com.team2.lms.repository;
import com.team2.lms.entity.QuizAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, Long> {
    List<QuizAttempt> findByStudentId(Long studentId);
    boolean existsByQuizIdAndStudentIdAndStatus(Long quizId, Long studentId, QuizAttempt.Status status);
}
