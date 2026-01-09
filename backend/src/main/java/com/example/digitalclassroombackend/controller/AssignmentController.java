package com.example.digitalclassroombackend.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.digitalclassroombackend.model.Assignment;
import com.example.digitalclassroombackend.model.Grades;
import com.example.digitalclassroombackend.model.Submission;
import com.example.digitalclassroombackend.model.User;
import com.example.digitalclassroombackend.repository.AssignmentRepository;
import com.example.digitalclassroombackend.repository.GradesRepository;
import com.example.digitalclassroombackend.repository.SubmissionRepository;
import com.example.digitalclassroombackend.repository.UserRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;

@RestController
@RequestMapping("/api/assignments")
@CrossOrigin(origins = "http://localhost:3000")
public class AssignmentController {

    @Autowired
    private AssignmentRepository assignmentRepository;

    @Autowired
    private SubmissionRepository submissionRepository;

    @Autowired
    private GradesRepository gradesRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public List<Assignment> getAllAssignments() {
        return assignmentRepository.findAll();
    }

    @PostMapping(value = "/submit", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> submitAssignment(
            @RequestParam("assignmentId") Long assignmentId,
            @RequestParam("username") String username,
            @RequestParam("file") MultipartFile file) {

        if (username == null || username.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Username is required");
        }

        Assignment assignment = assignmentRepository.findById(assignmentId).orElse(null);
        if (assignment == null) return ResponseEntity.badRequest().body("Assignment not found");

        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body("User not found");
        }

        // Check if user has already submitted this assignment
        boolean alreadySubmitted = submissionRepository.findAll().stream()
            .anyMatch(s -> s.getAssignment().getId().equals(assignmentId) &&
                          s.getSubmittedBy().getId().equals(user.getId()));

        if (alreadySubmitted) {
            return ResponseEntity.badRequest().body("You have already submitted this assignment");
        }

        try {
            // Handle file upload
            String uploadDir = "backend/uploads/submissions/";
            java.nio.file.Path uploadPath = java.nio.file.Paths.get(uploadDir);
            if (!java.nio.file.Files.exists(uploadPath)) {
                java.nio.file.Files.createDirectories(uploadPath);
            }

            String originalFilename = file.getOriginalFilename();
            String fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
            String uniqueFilename = System.currentTimeMillis() + "_" + username + "_" + originalFilename;

            java.nio.file.Path filePath = uploadPath.resolve(uniqueFilename);
            java.nio.file.Files.copy(file.getInputStream(), filePath, java.nio.file.StandardCopyOption.REPLACE_EXISTING);

            // Create submission
            Submission submission = new Submission();
            submission.setAssignment(assignment);
            submission.setSubmittedBy(user);
            submission.setFilePath(filePath.toString());
            submission.setFileName(originalFilename);
            submission.setFileType(file.getContentType());
            submission.setSubmitDate(java.time.LocalDateTime.now());
            submissionRepository.save(submission);

            return ResponseEntity.ok("Assignment submitted successfully");

        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Failed to save file: " + e.getMessage());
        }
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createAssignment(
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("subject") String subject,
            @RequestParam("classSemester") String classSemester,
            @RequestParam("accessType") String accessType,
            @RequestParam("assignedStudents") String assignedStudentsJson,
            @RequestParam("instructions") String instructions,
            @RequestParam("submissionType") String submissionType,
            @RequestParam("maxFileSize") Integer maxFileSize,
            @RequestParam("allowedFileTypes") String allowedFileTypes,
            @RequestParam("dueDate") String dueDate,
            @RequestParam("lateSubmissionPolicy") String lateSubmissionPolicy,
            @RequestParam("totalMarks") Integer totalMarks,
            @RequestParam(value = "file", required = false) MultipartFile file) {

        try {
            // Parse assigned students JSON
            ObjectMapper objectMapper = new ObjectMapper();
            List<Long> assignedStudentIds = Arrays.asList(objectMapper.readValue(assignedStudentsJson, Long[].class));

            // Create assignment object
            Assignment assignment = new Assignment();
            assignment.setTitle(title);
            assignment.setDescription(description);
            assignment.setSubject(subject);
            assignment.setClassSemester(classSemester);
            assignment.setAccessType(accessType);
            assignment.setInstructions(instructions);
            assignment.setSubmissionType(submissionType);
            assignment.setMaxFileSize(maxFileSize);
            assignment.setAllowedFileTypes(allowedFileTypes);
            assignment.setLateSubmissionPolicy(lateSubmissionPolicy);
            assignment.setTotalMarks(totalMarks);

            // Parse due date
            if (dueDate != null && !dueDate.isEmpty()) {
                assignment.setDueDate(LocalDateTime.parse(dueDate));
            }

            // Handle file upload
            if (file != null && !file.isEmpty()) {
                String fileName = file.getOriginalFilename();
                String uploadDir = "uploads/assignments/";
                Path uploadPath = Paths.get(uploadDir);
                if (!Files.exists(uploadPath)) {
                    Files.createDirectories(uploadPath);
                }
                Path filePath = uploadPath.resolve(fileName);
                Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
                assignment.setFilePath(filePath.toString());
                assignment.setFileName(fileName);
                assignment.setFileType(file.getContentType());
            }

            // Handle assigned students
            if (assignedStudentIds != null && !assignedStudentIds.isEmpty()) {
                Set<User> assignedStudents = new HashSet<>();
                for (Long studentId : assignedStudentIds) {
                    User student = userRepository.findById(studentId).orElse(null);
                    if (student != null) {
                        assignedStudents.add(student);
                    }
                }
                assignment.setAssignedStudents(assignedStudents);
            }

            // Set metadata
            User teacher = userRepository.findById(1L).orElse(null); // TODO: Get from JWT token
            assignment.setCreatedBy(teacher);
            assignment.setCreateDate(LocalDateTime.now());

            // Save assignment
            assignmentRepository.save(assignment);

            return ResponseEntity.ok("Assignment created successfully");

        } catch (JsonProcessingException e) {
            return ResponseEntity.badRequest().body("Invalid student selection format");
        } catch (IOException e) {
            return ResponseEntity.status(500).body("File upload failed: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to create assignment: " + e.getMessage());
        }
    }

    @GetMapping("/submissions")
    public List<Map<String, Object>> getAllSubmissions() {
        return submissionRepository.findAll().stream().map(submission -> {
            Map<String, Object> submissionMap = new java.util.HashMap<>();

            // Basic submission info
            submissionMap.put("id", submission.getId());
            submissionMap.put("filePath", submission.getFilePath());
            submissionMap.put("fileName", submission.getFileName());
            submissionMap.put("fileType", submission.getFileType());
            submissionMap.put("submitDate", submission.getSubmitDate());

            // Get grade from Grades table instead of submission
            Grades grade = gradesRepository.findBySubmission(submission);
            if (grade != null) {
                submissionMap.put("grade", grade.getMarks());
                submissionMap.put("feedback", grade.getFeedback());
                submissionMap.put("gradeStatus", grade.getStatus().toString());
                submissionMap.put("gradedAt", grade.getGradedAt());
                submissionMap.put("publishedAt", grade.getPublishedAt());
            } else {
                submissionMap.put("grade", null);
                submissionMap.put("feedback", null);
                submissionMap.put("gradeStatus", "PENDING");
                submissionMap.put("gradedAt", null);
                submissionMap.put("publishedAt", null);
            }

            // Assignment details
            Map<String, Object> assignmentMap = new java.util.HashMap<>();
            assignmentMap.put("id", submission.getAssignment().getId());
            assignmentMap.put("title", submission.getAssignment().getTitle());
            assignmentMap.put("totalMarks", submission.getAssignment().getTotalMarks());
            assignmentMap.put("dueDate", submission.getAssignment().getDueDate());
            submissionMap.put("assignment", assignmentMap);

            // Student details
            Map<String, Object> studentMap = new java.util.HashMap<>();
            studentMap.put("id", submission.getSubmittedBy().getId());
            studentMap.put("username", submission.getSubmittedBy().getUsername());
            studentMap.put("email", submission.getSubmittedBy().getEmail());
            submissionMap.put("submittedBy", studentMap);

            // Check if late submission
            boolean isLate = false;
            if (submission.getAssignment().getDueDate() != null) {
                isLate = submission.getSubmitDate().isAfter(submission.getAssignment().getDueDate());
            }
            submissionMap.put("isLateSubmission", isLate);

            return submissionMap;
        }).collect(java.util.stream.Collectors.toList());
    }

    @GetMapping("/submissions/{id}")
    public ResponseEntity<Map<String, Object>> getSubmissionById(@PathVariable Long id) {
        Submission submission = submissionRepository.findById(id).orElse(null);
        if (submission == null) {
            return ResponseEntity.notFound().build();
        }

        Map<String, Object> submissionMap = new java.util.HashMap<>();

        // Basic submission info
        submissionMap.put("id", submission.getId());
        submissionMap.put("filePath", submission.getFilePath());
        submissionMap.put("fileName", submission.getFileName());
        submissionMap.put("fileType", submission.getFileType());
        submissionMap.put("submitDate", submission.getSubmitDate());

        // Get grade from Grades table instead of submission
        Grades grade = gradesRepository.findBySubmission(submission);
        if (grade != null) {
            submissionMap.put("grade", grade.getMarks());
            submissionMap.put("feedback", grade.getFeedback());
            submissionMap.put("gradeStatus", grade.getStatus().toString());
            submissionMap.put("gradedAt", grade.getGradedAt());
            submissionMap.put("publishedAt", grade.getPublishedAt());
        } else {
            submissionMap.put("grade", null);
            submissionMap.put("feedback", null);
            submissionMap.put("gradeStatus", "PENDING");
            submissionMap.put("gradedAt", null);
            submissionMap.put("publishedAt", null);
        }

        // Assignment details
        Map<String, Object> assignmentMap = new java.util.HashMap<>();
        assignmentMap.put("id", submission.getAssignment().getId());
        assignmentMap.put("title", submission.getAssignment().getTitle());
        assignmentMap.put("totalMarks", submission.getAssignment().getTotalMarks());
        assignmentMap.put("dueDate", submission.getAssignment().getDueDate());
        submissionMap.put("assignment", assignmentMap);

        // Student details - the actual student who submitted
        Map<String, Object> studentMap = new java.util.HashMap<>();
        studentMap.put("id", submission.getSubmittedBy().getId());
        studentMap.put("username", submission.getSubmittedBy().getUsername());
        studentMap.put("email", submission.getSubmittedBy().getEmail());
        submissionMap.put("submittedBy", studentMap);

        // Check if late submission
        boolean isLate = false;
        if (submission.getAssignment().getDueDate() != null) {
            isLate = submission.getSubmitDate().isAfter(submission.getAssignment().getDueDate());
        }
        submissionMap.put("isLateSubmission", isLate);

        return ResponseEntity.ok(submissionMap);
    }

    @GetMapping("/{assignmentId}/rubric")
    public ResponseEntity<?> getAssignmentRubric(@PathVariable Long assignmentId) {
        Assignment assignment = assignmentRepository.findById(assignmentId).orElse(null);
        if (assignment == null) {
            return ResponseEntity.badRequest().body("Assignment not found");
        }

        if (assignment.getRubric() == null) {
            return ResponseEntity.ok(null); // No rubric for this assignment
        }

        // Create response with rubric and criteria
        Map<String, Object> response = new HashMap<>();
        response.put("id", assignment.getRubric().getId());
        response.put("title", assignment.getRubric().getTitle());
        response.put("description", assignment.getRubric().getDescription());

        // Add criteria
        List<Map<String, Object>> criteriaList = assignment.getRubric().getCriteria().stream()
            .sorted((a, b) -> Integer.compare(a.getOrderIndex(), b.getOrderIndex()))
            .map(criteria -> {
                Map<String, Object> criteriaMap = new HashMap<>();
                criteriaMap.put("id", criteria.getId());
                criteriaMap.put("criteriaName", criteria.getCriteriaName());
                criteriaMap.put("description", criteria.getDescription());
                criteriaMap.put("maxPoints", criteria.getMaxPoints());
                criteriaMap.put("orderIndex", criteria.getOrderIndex());
                return criteriaMap;
            })
            .collect(java.util.stream.Collectors.toList());

        response.put("criteria", criteriaList);

        return ResponseEntity.ok(response);
    }
}
