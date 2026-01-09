package com.example.digitalclassroombackend.controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.digitalclassroombackend.model.User;
import com.example.digitalclassroombackend.repository.AssignmentRepository;
import com.example.digitalclassroombackend.repository.QuizRepository;
import com.example.digitalclassroombackend.repository.SubmissionRepository;
import com.example.digitalclassroombackend.repository.UserRepository;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:3000")
public class AdminController {

    private final UserRepository userRepository;
    private final QuizRepository quizRepository;
    private final AssignmentRepository assignmentRepository;
    private final SubmissionRepository submissionRepository;

    public AdminController(UserRepository userRepository, QuizRepository quizRepository,
                          AssignmentRepository assignmentRepository, SubmissionRepository submissionRepository) {
        this.userRepository = userRepository;
        this.quizRepository = quizRepository;
        this.assignmentRepository = assignmentRepository;
        this.submissionRepository = submissionRepository;
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userRepository.findAll();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/users/pending")
    public ResponseEntity<List<User>> getPendingUsers() {
        List<User> pendingUsers = userRepository.findAll().stream()
                .filter(user -> "PENDING".equals(user.getStatus()))
                .toList();
        return ResponseEntity.ok(pendingUsers);
    }

    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Long>> getStatistics() {
        long totalTeachers = userRepository.findAll().stream()
                .filter(user -> "TEACHER".equals(user.getRole().name()) && "APPROVED".equals(user.getStatus()))
                .count();
        long totalStudents = userRepository.findAll().stream()
                .filter(user -> "STUDENT".equals(user.getRole().name()) && "APPROVED".equals(user.getStatus()))
                .count();
        long activeUsers = userRepository.findAll().stream()
                .filter(user -> "APPROVED".equals(user.getStatus()))
                .count();
        long pendingApprovals = userRepository.findAll().stream()
                .filter(user -> "PENDING".equals(user.getStatus()))
                .count();
        long totalQuizzes = quizRepository.count();
        long totalAssignments = assignmentRepository.count();
        long totalSubmissions = submissionRepository.count();

        Map<String, Long> stats = Map.of(
                "totalTeachers", totalTeachers,
                "totalStudents", totalStudents,
                "activeUsers", activeUsers,
                "pendingApprovals", pendingApprovals,
                "totalQuizzes", totalQuizzes,
                "totalAssignments", totalAssignments,
                "totalSubmissions", totalSubmissions
        );
        return ResponseEntity.ok(stats);
    }

    @PostMapping("/users/{userId}/approve")
    public ResponseEntity<?> approveUser(@PathVariable Long userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body("User not found");
        }
        user.setStatus("APPROVED");
        user.setApprovedAt(LocalDateTime.now());
        userRepository.save(user);
        return ResponseEntity.ok("User approved successfully");
    }

    @PostMapping("/users/{userId}/reject")
    public ResponseEntity<?> rejectUser(@PathVariable Long userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body("User not found");
        }
        user.setStatus("REJECTED");
        userRepository.save(user);
        return ResponseEntity.ok("User rejected");
    }

    @PostMapping("/users/{userId}/activate")
    public ResponseEntity<?> activateUser(@PathVariable Long userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body("User not found");
        }
        user.setStatus("APPROVED");
        if (user.getApprovedAt() == null) {
            user.setApprovedAt(LocalDateTime.now());
        }
        userRepository.save(user);
        return ResponseEntity.ok("User activated successfully");
    }

    @PostMapping("/users/{userId}/deactivate")
    public ResponseEntity<?> deactivateUser(@PathVariable Long userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body("User not found");
        }
        // Assuming deactivate means set to REJECTED or something, but since frontend uses it for approved users, perhaps set to REJECTED.
        // Looking at frontend, for approved users, deactivate button, so perhaps set to REJECTED.
        user.setStatus("REJECTED");
        userRepository.save(user);
        return ResponseEntity.ok("User deactivated");
    }

    @PutMapping("/users/{userId}/role")
    public ResponseEntity<?> changeUserRole(@PathVariable Long userId, @RequestBody Map<String, String> request) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body("User not found");
        }
        String newRole = request.get("role");
        if ("ADMIN".equals(newRole)) {
            user.setRole(User.Role.SUPER_ADMIN);
        } else if ("TEACHER".equals(newRole)) {
            user.setRole(User.Role.TEACHER);
        } else if ("STUDENT".equals(newRole)) {
            user.setRole(User.Role.STUDENT);
        }
        userRepository.save(user);
        return ResponseEntity.ok("User role updated successfully");
    }
}
