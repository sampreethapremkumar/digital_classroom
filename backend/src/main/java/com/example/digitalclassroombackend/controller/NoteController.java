package com.example.digitalclassroombackend.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
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
    public ResponseEntity<?> createNote(@RequestParam("file") MultipartFile file, @RequestParam("title") String title) {
        User user = userRepository.findById(1L).orElse(null);
        Note note = new Note();
        note.setTitle(title);
        note.setUploadedBy(user);
        note.setUploadDate(LocalDateTime.now());
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
    }
}
