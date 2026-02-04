# 📚 Digital Classroom Management System

A full-stack **Digital Classroom Management System** that enables **Admins, Teachers, and Students** to manage classroom activities such as assignments, quizzes, grading, and approvals in a centralized platform.

---

## 🚀 Features

### 👑 Admin Module
- Default **Super Admin** login
- Approve / Reject **Teacher** registrations
- Approve / Reject **Student** registrations
- Activate / Deactivate users
- View overall system statistics
- Separate admin login and dashboard

---

### 👨‍🏫 Teacher Module
- Secure login after admin approval
- Create and manage **Assignments**
- Create and manage **Quizzes**
- Upload **Notes**
- View student submissions
- Grade assignments using **Rubrics**
- Publish / Unpublish grades
- Teacher-specific dashboard (no shared data)

---

### 👩‍🎓 Student Module
- Secure login after admin approval
- View notes uploaded by teachers
- Submit assignments
- Take quizzes
- View quiz results instantly
- View graded assignments with rubric breakdown
- Student-specific dashboard

---

### 🧮 Rubric-Based Grading
- Teachers can split total marks into criteria:
  - Logic
  - Code Quality
  - Output
- Auto calculation of total marks and percentage
- Transparent grading for students

---

## 🛠 Tech Stack

### Frontend
- React
- HTML, CSS, JavaScript
- Axios

### Backend
- Spring Boot
- Java
- REST APIs

### Database
- MySQL

### Tools
- Git & GitHub
- VS Code
- Postman

---

## 🔐 Authentication & Authorization
- Role-based access control:
  - `SUPER_ADMIN`
  - `TEACHER`
  - `STUDENT`
- Admin approval required for teachers and students
- Separate login routes for each role

---

## 🗄 Database Design (Overview)

Main tables:
- `users`
- `assignments`
- `assignment_submissions`
- `quizzes`
- `quiz_questions`
- `quiz_results`
- `rubrics`
- `rubric_criteria`
- `rubric_scores`

---

## ▶️ How to Run the Project

### 1️⃣ Backend (Spring Boot)
```bash
cd backend
mvn spring-boot:run
