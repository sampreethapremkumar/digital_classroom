package com.example.digitalclassroombackend.controller;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.digitalclassroombackend.model.Assignment;
import com.example.digitalclassroombackend.model.Grades;
import com.example.digitalclassroombackend.model.Submission;
import com.example.digitalclassroombackend.model.User;
import com.example.digitalclassroombackend.repository.AssignmentRepository;
import com.example.digitalclassroombackend.repository.GradesRepository;
import com.example.digitalclassroombackend.repository.NoteRepository;
import com.example.digitalclassroombackend.repository.QuizRepository;
import com.example.digitalclassroombackend.repository.SubmissionRepository;
import com.example.digitalclassroombackend.repository.UserRepository;

@RestController
@RequestMapping("/api/teacher")
@CrossOrigin(origins = {"http://localhost:3000", "https://digital-classroom-*", "https://*.vercel.app", "https://*.vercel-preview.app"})
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

    // Grading endpoints
    @PostMapping("/grades")
    public ResponseEntity<?> submitGrade(@RequestBody Map<String, Object> requestData) {
        try {
            // Get current authenticated user (teacher)
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            User teacher = userRepository.findByUsername(username).orElse(null);

            if (teacher == null) {
                return ResponseEntity.status(401).body("User not authenticated");
            }

            Long submissionId = Long.valueOf(requestData.get("submission_id").toString());
            Submission submission = submissionRepository.findById(submissionId).orElse(null);

            if (submission == null) {
                return ResponseEntity.badRequest().body("Submission not found");
            }

            // Check if teacher has permission to grade this assignment
            if (!submission.getAssignment().getCreatedBy().getId().equals(teacher.getId())) {
                return ResponseEntity.status(403).body("You can only grade assignments you created");
            }

            // Check if already graded
            Grades existingGrade = gradesRepository.findBySubmission(submission);
            if (existingGrade != null && "PUBLISHED".equals(existingGrade.getStatus().name())) {
                return ResponseEntity.badRequest().body("This submission has already been graded and published");
            }

            // Create or update grade
            Grades grade;
            if (existingGrade != null) {
                grade = existingGrade;
            } else {
                grade = new Grades();
                grade.setSubmission(submission);
            }

            // Set marks and feedback
            if (requestData.containsKey("marks")) {
                grade.setMarks(Double.valueOf(requestData.get("marks").toString()));
            }

            if (requestData.containsKey("rubricScores")) {
                // Handle rubric scores - calculate total from rubric
                @SuppressWarnings("unchecked")
                java.util.List<Map<String, Object>> rubricScores = (java.util.List<Map<String, Object>>) requestData.get("rubricScores");
                double totalScore = rubricScores.stream()
                    .mapToDouble(score -> Double.valueOf(score.get("score").toString()))
                    .sum();
                grade.setMarks(totalScore);
            }

            grade.setFeedback(requestData.get("feedback").toString());

            // Set status based on action
            String action = (String) requestData.get("action");
            if ("publish".equals(action)) {
                grade.setStatus(Grades.GradeStatus.PUBLISHED);
                grade.setPublishedAt(LocalDateTime.now());
            } else {
                grade.setStatus(Grades.GradeStatus.GRADED);
            }

            grade.setGradedAt(LocalDateTime.now());

            gradesRepository.save(grade);

            return ResponseEntity.ok("Grade " + ("publish".equals(action) ? "submitted" : "saved as draft") + " successfully");

        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to submit grade: " + e.getMessage());
        }
    }

    @GetMapping("/grades/submission/{submissionId}")
    public ResponseEntity<?> getGradeBySubmission(@PathVariable Long submissionId) {
        try {
            Submission submission = submissionRepository.findById(submissionId).orElse(null);
            if (submission == null) {
                return ResponseEntity.notFound().build();
            }

            Grades grade = gradesRepository.findBySubmission(submission);
            if (grade == null) {
                return ResponseEntity.ok(null);
            }

            Map<String, Object> gradeData = new HashMap<>();
            gradeData.put("id", grade.getId());
            gradeData.put("marks", grade.getMarks());
            gradeData.put("feedback", grade.getFeedback());
            gradeData.put("status", grade.getStatus().name());
            gradeData.put("gradedAt", grade.getGradedAt());
            gradeData.put("publishedAt", grade.getPublishedAt());

            return ResponseEntity.ok(gradeData);

        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to fetch grade: " + e.getMessage());
        }
    }

    @PostMapping("/grades/{gradeId}/reject")
    public ResponseEntity<?> rejectSubmission(@PathVariable Long gradeId, @RequestBody Map<String, Object> requestData) {
        try {
            // Get current authenticated user (teacher)
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            User teacher = userRepository.findByUsername(username).orElse(null);

            if (teacher == null) {
                return ResponseEntity.status(401).body("User not authenticated");
            }

            Grades grade = gradesRepository.findById(gradeId).orElse(null);
            if (grade == null) {
                return ResponseEntity.notFound().build();
            }

            // Check if teacher has permission
            if (!grade.getSubmission().getAssignment().getCreatedBy().getId().equals(teacher.getId())) {
                return ResponseEntity.status(403).body("You can only manage grades for assignments you created");
            }

            // Update grade status to rejected
            grade.setStatus(Grades.GradeStatus.REJECTED);
            grade.setFeedback(requestData.get("reason").toString());
            grade.setPublishedAt(LocalDateTime.now());

            gradesRepository.save(grade);

            return ResponseEntity.ok("Submission rejected successfully");

        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to reject submission: " + e.getMessage());
        }
    }
}
