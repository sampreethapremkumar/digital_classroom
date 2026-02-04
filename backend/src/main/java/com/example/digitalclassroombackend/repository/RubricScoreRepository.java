package com.example.digitalclassroombackend.repository;

import com.example.digitalclassroombackend.model.RubricScore;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RubricScoreRepository extends JpaRepository<RubricScore, Long> {
    List<RubricScore> findBySubmissionId(Long submissionId);
}
