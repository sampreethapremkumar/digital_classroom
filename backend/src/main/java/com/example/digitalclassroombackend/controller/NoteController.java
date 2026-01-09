package com.example.digitalclassroombackend.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

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

import com.example.digitalclassroombackend.model.Note;
import com.example.digitalclassroombackend.model.User;
import com.example.digitalclassroombackend.repository.NoteRepository;
import com.example.digitalclassroombackend.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;

@RestController
@RequestMapping("/api/notes")
@CrossOrigin(origins = "http://localhost:3000")
public class NoteController {

    @Autowired
    private NoteRepository noteRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/notes")
    public List<Note> getAllNotes() {
        return noteRepository.findAll();
    }

    @GetMapping("/download/{id}")
    public ResponseEntity<byte[]> downloadNote(@PathVariable Long id) throws IOException {
        Note note = noteRepository.findById(id).orElse(null);
        if (note == null) {
            return ResponseEntity.notFound().build();
        }
        Path path = Paths.get(note.getFilePath());
        byte[] data = Files.readAllBytes(path);
        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=\"" + note.getFileName() + "\"")
                .contentType(MediaType.parseMediaType(note.getFileType()))
                .body(data);
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

            // Handle file upload
            if (!file.isEmpty()) {
                try {
                    String fileName = file.getOriginalFilename();
                    String uploadDir = "uploads/";
                    Path uploadPath = Paths.get(uploadDir);
                    if (!Files.exists(uploadPath)) {
                        Files.createDirectories(uploadPath);
                    }
                    Path filePath = uploadPath.resolve(fileName);
                    Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
                    note.setFilePath(filePath.toString());
                    note.setFileName(fileName);
                    note.setFileType(file.getContentType());
                } catch (IOException e) {
                    return ResponseEntity.status(500).body("File upload failed");
                }
            }

            noteRepository.save(note);
            return ResponseEntity.ok("Note uploaded successfully");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Upload failed: " + e.getMessage());
        }
    }
}
