package com.example.digitalclassroombackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.digitalclassroombackend.model.QuizSubmission;

public interface QuizSubmissionRepository extends JpaRepository<QuizSubmission, Long> {
}
