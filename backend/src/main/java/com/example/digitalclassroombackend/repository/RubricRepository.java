package com.example.digitalclassroombackend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.digitalclassroombackend.model.Rubric;

public interface RubricRepository extends JpaRepository<Rubric, Long> {
    List<Rubric> findByCreatedById(Long teacherId);
}
