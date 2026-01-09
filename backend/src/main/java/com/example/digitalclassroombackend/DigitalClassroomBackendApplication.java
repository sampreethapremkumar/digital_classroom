package com.example.digitalclassroombackend;

import java.time.LocalDateTime;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.example.digitalclassroombackend.model.User;
import com.example.digitalclassroombackend.repository.UserRepository;

@SpringBootApplication
public class DigitalClassroomBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(DigitalClassroomBackendApplication.class, args);
	}

	@Bean
	CommandLineRunner initDatabase(UserRepository userRepository, PasswordEncoder passwordEncoder) {
		return args -> {
			// Create default admin user if not exists
			if (userRepository.findByUsername("admin").isEmpty()) {
				User admin = new User();
				admin.setUsername("admin");
				admin.setEmail("admin@classroom.com");
				admin.setPassword(passwordEncoder.encode("123"));
				admin.setRole(User.Role.SUPER_ADMIN);
				admin.setStatus("APPROVED");
				admin.setCreatedAt(LocalDateTime.now());
				admin.setApprovedAt(LocalDateTime.now());
				userRepository.save(admin);
				System.out.println("Default admin user created: username=admin, password=123");
			}
		};
	}

}
