package com.example.digitalclassroombackend.controller;

import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.digitalclassroombackend.model.User;
import com.example.digitalclassroombackend.repository.AssignmentRepository;
import com.example.digitalclassroombackend.repository.GradesRepository;
import com.example.digitalclassroombackend.repository.NoteRepository;
import com.example.digitalclassroombackend.repository.QuizRepository;
import com.example.digitalclassroombackend.repository.SubmissionRepository;
import com.example.digitalclassroombackend.repository.UserRepository;

@RestController
@RequestMapping("/api/teacher")
@CrossOrigin(origins = "http://localhost:3000")
public class TeacherController {

    @Autowired
    private AssignmentRepository assignmentRepository;

    @Autowired
    private GradesRepository gradesRepository;

    @Autowired
    private NoteRepository noteRepository;

    @Autowired
    private QuizRepository quizRepository;

    @Autowired
    private SubmissionRepository submissionRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/stats")
    public Map<String, Long> getTeacherStats(@RequestParam(required = false) String username) {
        // Find the teacher
        final User teacher;
        if (username != null && !username.trim().isEmpty()) {
            teacher = userRepository.findByUsername(username).orElse(null);
        } else {
            teacher = userRepository.findById(1L).orElse(null);
        }

        if (teacher == null) {
            // Return empty stats if no teacher found
            Map<String, Long> emptyStats = new java.util.HashMap<>();
            emptyStats.put("notesCount", 0L);
            emptyStats.put("assignmentsCount", 0L);
            emptyStats.put("quizzesCount", 0L);
            emptyStats.put("submissionsCount", 0L);
            return emptyStats;
        }

        final Long teacherId = teacher.getId();
        Map<String, Long> stats = new java.util.HashMap<>();

        // Filter notes by teacher
        long notesCount = noteRepository.findAll().stream()
            .filter(note -> note.getUploadedBy() != null && note.getUploadedBy().getId().equals(teacherId))
            .count();
        stats.put("notesCount", notesCount);

        // Filter assignments by teacher
        long assignmentsCount = assignmentRepository.findAll().stream()
            .filter(assignment -> assignment.getCreatedBy() != null && assignment.getCreatedBy().getId().equals(teacherId))
            .count();
        stats.put("assignmentsCount", assignmentsCount);

        // Filter quizzes by teacher
        long quizzesCount = quizRepository.findAll().stream()
            .filter(quiz -> quiz.getCreatedBy() != null && quiz.getCreatedBy().getId().equals(teacherId))
            .count();
        stats.put("quizzesCount", quizzesCount);

        // Count submissions for assignments created by this teacher
        long submissionsCount = submissionRepository.findAll().stream()
            .filter(submission -> submission.getAssignment() != null &&
                               submission.getAssignment().getCreatedBy() != null &&
                               submission.getAssignment().getCreatedBy().getId().equals(teacherId))
            .count();
        stats.put("submissionsCount", submissionsCount);

        return stats;
    }
}
