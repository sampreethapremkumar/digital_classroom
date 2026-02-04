-- Database initialization script for Digital Classroom
-- This ensures database constraints and initial setup

-- Note: MySQL doesn't support partial indexes with WHERE clauses like PostgreSQL
-- The constraint for one SUPER_ADMIN is enforced in the application layer
-- via the create-admin endpoint and backend validation

-- Insert default admin user
INSERT IGNORE INTO users (username, email, password, role, status, created_at, approved_at)
VALUES ('admin', 'admin@classroom.com',
        '$2a$10$8K3.6Rnugt0C.3Y8bYXoUe0ZzKjK9tHdHqGJZzKjK9tHdHqGJZzKj', -- BCrypt hash for '123'
        'SUPER_ADMIN', 'APPROVED', NOW(), NOW());

-- Insert default teacher user
INSERT IGNORE INTO users (username, email, password, role, status, created_at, approved_at)
VALUES ('teacher', 'teacher@classroom.com',
        '$2a$10$8K3.6Rnugt0C.3Y8bYXoUe0ZzKjK9tHdHqGJZzKjK9tHdHqGJZzKj', -- BCrypt hash for '123'
        'TEACHER', 'APPROVED', NOW(), NOW());

-- Insert test student users
INSERT IGNORE INTO users (username, email, password, role, status, created_at, approved_at)
VALUES ('student1', 'student1@classroom.com',
        '$2a$10$8K3.6Rnugt0C.3Y8bYXoUe0ZzKjK9tHdHqGJZzKjK9tHdHqGJZzKj', -- BCrypt hash for '123'
        'STUDENT', 'APPROVED', NOW(), NOW());

INSERT IGNORE INTO users (username, email, password, role, status, created_at, approved_at)
VALUES ('student2', 'student2@classroom.com',
        '$2a$10$8K3.6Rnugt0C.3Y8bYXoUe0ZzKjK9tHdHqGJZzKjK9tHdHqGJZzKj', -- BCrypt hash for '123'
        'STUDENT', 'APPROVED', NOW(), NOW());

INSERT IGNORE INTO users (username, email, password, role, status, created_at, approved_at)
VALUES ('student3', 'student3@classroom.com',
        '$2a$10$8K3.6Rnugt0C.3Y8bYXoUe0ZzKjK9tHdHqGJZzKjK9tHdHqGJZzKj', -- BCrypt hash for '123'
        'STUDENT', 'APPROVED', NOW(), NOW());
