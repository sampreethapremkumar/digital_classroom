package com.example.digitalclassroombackend.model;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "grades")
public class Grades {

    public enum GradeStatus {
        PENDING,    // Not graded yet
        GRADED,     // Marks entered, draft mode
        PUBLISHED,  // Visible to students
        REJECTED    // Invalid submission
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "submission_id")
    private Submission submission;

    private Double marks;

    private Double penaltyMarks; // Late submission penalty

    private String penaltyReason; // Reason for penalty

    private String feedback;

    @Enumerated(EnumType.STRING)
    private GradeStatus status; // PENDING, GRADED, PUBLISHED, REJECTED

    private Boolean isLateSubmission;

    private LocalDateTime gradedAt;

    private LocalDateTime publishedAt;

    private Integer revisionNumber; // For re-evaluation tracking

    private String previousMarks; // JSON string of previous grades for history

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Submission getSubmission() {
        return submission;
    }

    public void setSubmission(Submission submission) {
        this.submission = submission;
    }

    public Double getMarks() {
        return marks;
    }

    public void setMarks(Double marks) {
        this.marks = marks;
    }

    public Double getPenaltyMarks() {
        return penaltyMarks;
    }

    public void setPenaltyMarks(Double penaltyMarks) {
        this.penaltyMarks = penaltyMarks;
    }

    public String getPenaltyReason() {
        return penaltyReason;
    }

    public void setPenaltyReason(String penaltyReason) {
        this.penaltyReason = penaltyReason;
    }

    public String getFeedback() {
        return feedback;
    }

    public void setFeedback(String feedback) {
        this.feedback = feedback;
    }

    public GradeStatus getStatus() {
        return status;
    }

    public void setStatus(GradeStatus status) {
        this.status = status;
    }

    public Boolean getIsLateSubmission() {
        return isLateSubmission;
    }

    public void setIsLateSubmission(Boolean isLateSubmission) {
        this.isLateSubmission = isLateSubmission;
    }

    public LocalDateTime getGradedAt() {
        return gradedAt;
    }

    public void setGradedAt(LocalDateTime gradedAt) {
        this.gradedAt = gradedAt;
    }

    public LocalDateTime getPublishedAt() {
        return publishedAt;
    }

    public void setPublishedAt(LocalDateTime publishedAt) {
        this.publishedAt = publishedAt;
    }

    public Integer getRevisionNumber() {
        return revisionNumber;
    }

    public void setRevisionNumber(Integer revisionNumber) {
        this.revisionNumber = revisionNumber;
    }

    public String getPreviousMarks() {
        return previousMarks;
    }

    public void setPreviousMarks(String previousMarks) {
        this.previousMarks = previousMarks;
    }
}
