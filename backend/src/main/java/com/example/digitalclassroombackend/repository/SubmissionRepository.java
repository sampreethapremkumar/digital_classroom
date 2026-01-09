package com.example.digitalclassroombackend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.digitalclassroombackend.model.Submission;

@Repository
public interface SubmissionRepository extends JpaRepository<Submission, Long> {
    List<Submission> findBySubmittedById(Long id);
}
