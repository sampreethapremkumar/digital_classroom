package com.example.digitalclassroombackend.model;

import java.time.LocalDateTime;
import java.util.Set;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;

@Entity
@Table(name = "assignments")
public class Assignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String title;

    private String description;

    private String filePath;

    private String fileName;

    private String fileType;

    private LocalDateTime dueDate;

    @ManyToOne
    @JoinColumn(name = "created_by")
    private User createdBy;

    private LocalDateTime createDate;

    // New fields for enhanced assignment functionality
    private String subject; // e.g., "Java", "DBMS", "OS"

    private String classSemester; // e.g., "CSE – Semester 5", "IT – Semester 6"

    @ManyToMany
    @JoinTable(
        name = "assignment_assigned_students",
        joinColumns = @JoinColumn(name = "assignment_id"),
        inverseJoinColumns = @JoinColumn(name = "student_id")
    )
    private Set<User> assignedStudents;

    private String instructions; // Detailed assignment guidelines

    private String submissionType; // "FILE", "TEXT", "BOTH"

    private Integer maxFileSize = 10; // Maximum file size in MB

    private String allowedFileTypes; // Comma-separated file types (e.g., "pdf,docx,zip")

    private String lateSubmissionPolicy; // "ALLOW", "DISALLOW", "PENALTY"

    private Integer totalMarks; // Total marks for the assignment

    private String accessType; // "ALL_CLASS" or "SELECTED_STUDENTS"

    @ManyToOne
    @JoinColumn(name = "rubric_id")
    private Rubric rubric;

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getFilePath() {
        return filePath;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getFileType() {
        return fileType;
    }

    public void setFileType(String fileType) {
        this.fileType = fileType;
    }

    public LocalDateTime getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDateTime dueDate) {
        this.dueDate = dueDate;
    }

    public User getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(User createdBy) {
        this.createdBy = createdBy;
    }

    public LocalDateTime getCreateDate() {
        return createDate;
    }

    public void setCreateDate(LocalDateTime createDate) {
        this.createDate = createDate;
    }

    // Getters and Setters for new fields
    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getClassSemester() {
        return classSemester;
    }

    public void setClassSemester(String classSemester) {
        this.classSemester = classSemester;
    }

    public Set<User> getAssignedStudents() {
        return assignedStudents;
    }

    public void setAssignedStudents(Set<User> assignedStudents) {
        this.assignedStudents = assignedStudents;
    }

    public String getInstructions() {
        return instructions;
    }

    public void setInstructions(String instructions) {
        this.instructions = instructions;
    }

    public String getSubmissionType() {
        return submissionType;
    }

    public void setSubmissionType(String submissionType) {
        this.submissionType = submissionType;
    }

    public Integer getMaxFileSize() {
        return maxFileSize;
    }

    public void setMaxFileSize(Integer maxFileSize) {
        this.maxFileSize = maxFileSize;
    }

    public String getAllowedFileTypes() {
        return allowedFileTypes;
    }

    public void setAllowedFileTypes(String allowedFileTypes) {
        this.allowedFileTypes = allowedFileTypes;
    }

    public String getLateSubmissionPolicy() {
        return lateSubmissionPolicy;
    }

    public void setLateSubmissionPolicy(String lateSubmissionPolicy) {
        this.lateSubmissionPolicy = lateSubmissionPolicy;
    }

    public Integer getTotalMarks() {
        return totalMarks;
    }

    public void setTotalMarks(Integer totalMarks) {
        this.totalMarks = totalMarks;
    }

    public String getAccessType() {
        return accessType;
    }

    public void setAccessType(String accessType) {
        this.accessType = accessType;
    }

    public Rubric getRubric() {
        return rubric;
    }

    public void setRubric(Rubric rubric) {
        this.rubric = rubric;
    }
}
