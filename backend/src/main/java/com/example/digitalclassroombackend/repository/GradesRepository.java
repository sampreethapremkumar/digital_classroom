package com.example.digitalclassroombackend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.digitalclassroombackend.model.Grades;
import com.example.digitalclassroombackend.model.Submission;

public interface GradesRepository extends JpaRepository<Grades, Long> {

    Grades findBySubmission(Submission submission);

    // Find grades by assignment (for grade summaries)
    List<Grades> findBySubmissionAssignmentId(Long assignmentId);

    // Find published grades by assignment
    List<Grades> findBySubmissionAssignmentIdAndStatus(Long assignmentId, Grades.GradeStatus status);
}
