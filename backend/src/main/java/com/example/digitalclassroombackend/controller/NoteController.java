package com.example.digitalclassroombackend.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;

import com.example.digitalclassroombackend.model.Note;
import com.example.digitalclassroombackend.model.User;
import com.example.digitalclassroombackend.repository.NoteRepository;
import com.example.digitalclassroombackend.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;

@RestController
@RequestMapping("/api/notes")
@CrossOrigin(origins = {"http://localhost:3000", "https://digital-classroom-*", "https://*.vercel.app", "https://*.vercel-preview.app"})
public class NoteController {

    @Autowired
    private NoteRepository noteRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private Cloudinary cloudinary;

    @GetMapping("/notes")
    public List<Note> getAllNotes() {
        return noteRepository.findAll();
    }

    @GetMapping("/student/notes")
    public ResponseEntity<?> getStudentNotes() {
        try {
            // Get current authenticated user
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            User user = userRepository.findByUsername(username).orElse(null);

            if (user == null || !"STUDENT".equals(user.getRole().name())) {
                return ResponseEntity.status(403).body("Access denied");
            }

            // Get all notes and filter based on access rules
            List<Note> allNotes = noteRepository.findAll();
            List<Note> accessibleNotes = new ArrayList<>();

            for (Note note : allNotes) {
                boolean canAccess = false;

                if ("ALL_CLASS".equals(note.getAccessType())) {
                    // Check if student's class/semester matches the note's class/semester
                    canAccess = user.getClassSemester() != null &&
                               user.getClassSemester().equals(note.getClassSemester());
                } else if ("SELECTED_STUDENTS".equals(note.getAccessType())) {
                    // Check if student is in the assigned students list
                    canAccess = note.getAssignedStudents() != null &&
                               note.getAssignedStudents().contains(user);
                }

                if (canAccess) {
                    accessibleNotes.add(note);
                }
            }

            return ResponseEntity.ok(accessibleNotes);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error fetching notes: " + e.getMessage());
        }
    }

    @GetMapping("/download/{id}")
    public ResponseEntity<?> downloadNote(@PathVariable Long id) throws IOException {
        try {
            // Get current authenticated user
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            User user = userRepository.findByUsername(username).orElse(null);

            if (user == null) {
                return ResponseEntity.status(401).body("User not authenticated");
            }

            Note note = noteRepository.findById(id).orElse(null);
            if (note == null) {
                return ResponseEntity.notFound().build();
            }

            // Allow authenticated users to download notes
            // Students are already filtered to only see accessible notes via getStudentNotes
            boolean canAccess = true;

            // Only restrict access for non-authenticated users
            if (user == null) {
                canAccess = false;
            }

            if (!canAccess) {
                return ResponseEntity.status(403).body("Access denied");
            }

            // For Cloudinary-hosted files, redirect to the Cloudinary URL
            System.out.println("Download attempt for note ID: " + id);
            System.out.println("File URL: " + note.getFileUrl());
            System.out.println("File path: " + note.getFilePath());

            if (note.getFileUrl() != null && !note.getFileUrl().isEmpty()) {
                System.out.println("Redirecting to Cloudinary URL: " + note.getFileUrl());
                return ResponseEntity.status(302)
                        .header("Location", note.getFileUrl())
                        .header("Content-Disposition", "attachment; filename=\"" + note.getFileName() + "\"")
                        .build();
            }

            // Fallback: try local file (for backward compatibility)
            Path path = Paths.get(note.getFilePath());
            System.out.println("Attempting to download local file: " + note.getFilePath());
            System.out.println("File exists: " + Files.exists(path));
            if (!Files.exists(path)) {
                System.out.println("File not found at path: " + path.toAbsolutePath());
                return ResponseEntity.notFound().build();
            }

            byte[] data = Files.readAllBytes(path);
            return ResponseEntity.ok()
                    .header("Content-Disposition", "attachment; filename=\"" + note.getFileName() + "\"")
                    .contentType(MediaType.parseMediaType(note.getFileType() != null ? note.getFileType() : "application/octet-stream"))
                    .body(data);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error downloading file: " + e.getMessage());
        }
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createNote(
            @RequestParam("file") MultipartFile file,
            @RequestParam("title") String title,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam("subject") String subject,
            @RequestParam("classSemester") String classSemester,
            @RequestParam("accessType") String accessType,
            @RequestParam(value = "assignedStudents", required = false) String assignedStudentsJson) {

        try {
            // Get current authenticated user
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            User user = userRepository.findByUsername(username).orElse(null);

            if (user == null) {
                return ResponseEntity.status(401).body("User not authenticated");
            }

            Note note = new Note();
            note.setTitle(title);
            note.setDescription(description);
            note.setSubject(subject);
            note.setClassSemester(classSemester);
            note.setAccessType(accessType);
            note.setUploadedBy(user);
            note.setUploadDate(LocalDateTime.now());

            // Handle assigned students
            if ("SELECTED_STUDENTS".equals(accessType) && assignedStudentsJson != null && !assignedStudentsJson.isEmpty()) {
                try {
                    ObjectMapper objectMapper = new ObjectMapper();
                    List<Long> studentIds = objectMapper.readValue(assignedStudentsJson,
                        objectMapper.getTypeFactory().constructCollectionType(List.class, Long.class));

                    Set<User> assignedStudents = new HashSet<>();
                    for (Long studentId : studentIds) {
                        User student = userRepository.findById(studentId).orElse(null);
                        if (student != null && "STUDENT".equals(student.getRole().name())) {
                            assignedStudents.add(student);
                        }
                    }
                    note.setAssignedStudents(assignedStudents);
                } catch (Exception e) {
                    return ResponseEntity.status(400).body("Invalid assigned students format");
                }
            }

            // Handle file upload - try Cloudinary first, fallback to local storage
            if (!file.isEmpty()) {
                try {
                    String fileName = file.getOriginalFilename();

                    // Try Cloudinary upload first
                    try {
                        Map uploadResult = cloudinary.uploader().upload(file.getBytes(),
                            ObjectUtils.asMap(
                                "resource_type", "auto",
                                "public_id", "notes/" + System.currentTimeMillis() + "_" + fileName
                            ));

                        String secureUrl = (String) uploadResult.get("secure_url");
                        note.setFileUrl(secureUrl); // Use HTTPS URL
                        note.setFilePath((String) uploadResult.get("public_id")); // Store public_id for reference
                        note.setFileName(fileName);
                        note.setFileType(file.getContentType() != null ? file.getContentType() : "application/octet-stream");

                        System.out.println("File uploaded to Cloudinary: " + secureUrl);
                    } catch (Exception cloudinaryException) {
                        System.err.println("Cloudinary upload failed, falling back to local storage: " + cloudinaryException.getMessage());

                        // Fallback to local storage
                        String uploadDir = "uploads/";
                        Path uploadPath = Paths.get(uploadDir);
                        if (!Files.exists(uploadPath)) {
                            Files.createDirectories(uploadPath);
                        }
                        Path filePath = uploadPath.resolve(fileName);
                        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

                        note.setFilePath(filePath.toString());
                        note.setFileName(fileName);
                        note.setFileType(file.getContentType() != null ? file.getContentType() : "application/octet-stream");

                        System.out.println("File saved locally: " + filePath.toString());
                    }
                } catch (Exception e) {
                    System.err.println("File upload failed completely: " + e.getMessage());
                    return ResponseEntity.status(500).body("File upload failed: " + e.getMessage());
                }
            }

            noteRepository.save(note);
            return ResponseEntity.ok("Note uploaded successfully");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Upload failed: " + e.getMessage());
        }
    }
}
