package com.example.digitalclassroombackend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.digitalclassroombackend.model.QuizQuestion;

@Repository
public interface QuizQuestionRepository extends JpaRepository<QuizQuestion, Long> {
    @Query("SELECT q FROM QuizQuestion q WHERE q.quiz.id = :quizId ORDER BY q.orderIndex ASC")
    List<QuizQuestion> findByQuizIdOrderByOrderIndexAsc(@Param("quizId") Long quizId);
}
