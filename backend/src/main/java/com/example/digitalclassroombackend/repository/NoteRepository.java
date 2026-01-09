package com.example.digitalclassroombackend.repository;

import com.example.digitalclassroombackend.model.Note;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NoteRepository extends JpaRepository<Note, Long> {
}
