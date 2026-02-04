package com.example.digitalclassroombackend.repository;

import com.example.digitalclassroombackend.model.RubricCriteria;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RubricCriteriaRepository extends JpaRepository<RubricCriteria, Long> {
    List<RubricCriteria> findByRubricIdOrderByOrderIndex(Long rubricId);
}
