package com.example.digitalclassroombackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.digitalclassroombackend.model.Assignment;

@Repository
public interface AssignmentRepository extends JpaRepository<Assignment, Long> {
}
