package com.example.digitalclassroombackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.digitalclassroombackend.model.Quiz;

@Repository
public interface QuizRepository extends JpaRepository<Quiz, Long> {
}
