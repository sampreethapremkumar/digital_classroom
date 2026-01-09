package com.example.digitalclassroombackend.controller;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.digitalclassroombackend.dto.JwtResponse;
import com.example.digitalclassroombackend.dto.LoginRequest;
import com.example.digitalclassroombackend.model.User;
import com.example.digitalclassroombackend.repository.UserRepository;
import com.example.digitalclassroombackend.service.UserDetailsServiceImpl;
import com.example.digitalclassroombackend.util.JwtUtil;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    private final UserRepository userRepository;
    private final UserDetailsServiceImpl userDetailsService;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;

    public AuthController(UserRepository userRepository, UserDetailsServiceImpl userDetailsService, JwtUtil jwtUtil, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.userDetailsService = userDetailsService;
        this.jwtUtil = jwtUtil;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        if (userRepository.existsByUsername(user.getUsername()) || userRepository.existsByEmail(user.getEmail())) {
            return ResponseEntity.badRequest().body("Username or email already exists");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        // Set registration defaults
        user.setStatus("PENDING");
        user.setCreatedAt(LocalDateTime.now());

        userRepository.save(user);
        return ResponseEntity.ok("User registered successfully. Please wait for admin approval.");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        User user = userRepository.findByUsername(loginRequest.getUsername()).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body("User not found");
        }
        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            return ResponseEntity.badRequest().body("Invalid credentials");
        }
        if (!"APPROVED".equals(user.getStatus())) {
            return ResponseEntity.badRequest().body("Your account is pending admin approval");
        }
        UserDetails userDetails = new org.springframework.security.core.userdetails.User(user.getUsername(), user.getPassword(), new ArrayList<>());
        String token = jwtUtil.generateToken(userDetails);
        String role = user.getRole().name();
        String username = user.getUsername();
        return ResponseEntity.ok(new JwtResponse(token, role, username));
    }

    @GetMapping("/students")
    public ResponseEntity<List<User>> getAllStudents() {
        List<User> students = userRepository.findAll().stream()
                .filter(user -> "STUDENT".equals(user.getRole().name()))
                .toList();
        return ResponseEntity.ok(students);
    }

    @PostMapping("/create-admin")
    public ResponseEntity<?> createAdmin(@RequestBody User adminUser) {
        // Check if admin already exists
        long adminCount = userRepository.findAll().stream()
                .filter(user -> User.Role.SUPER_ADMIN.equals(user.getRole()))
                .count();

        if (adminCount > 0) {
            return ResponseEntity.badRequest().body("Admin user already exists");
        }

        if (userRepository.existsByUsername(adminUser.getUsername()) || userRepository.existsByEmail(adminUser.getEmail())) {
            return ResponseEntity.badRequest().body("Username or email already exists");
        }

        adminUser.setPassword(passwordEncoder.encode(adminUser.getPassword()));
        adminUser.setRole(User.Role.SUPER_ADMIN);
        adminUser.setStatus("APPROVED");
        adminUser.setCreatedAt(LocalDateTime.now());
        adminUser.setApprovedAt(LocalDateTime.now());

        userRepository.save(adminUser);
        return ResponseEntity.ok("Admin user created successfully");
    }
}
