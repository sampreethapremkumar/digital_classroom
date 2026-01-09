package com.example.digitalclassroombackend.model;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import jakarta.validation.constraints.NotBlank;

@Entity
@Table(name = "quizzes")
public class Quiz {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String title;

    @Column(length = 1000)
    private String description;

    @Column(length = 2000)
    private String instructions;

    // Academic Targeting
    private String subject;
    private String classSemester;
    private String accessType; // ALL_CLASS, SELECTED_STUDENTS

    @ManyToMany
    @JoinTable(
        name = "quiz_assigned_students",
        joinColumns = @JoinColumn(name = "quiz_id"),
        inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private Set<User> assignedStudents;

    // Quiz Metadata
    private Integer totalMarks;
    private Integer passingMarks;
    private String difficulty; // EASY, MEDIUM, HARD
    private Integer timeLimit; // in minutes
    private Integer maxAttempts; // 1 for single, >1 for multiple

    // Quiz Behavior
    private Boolean shuffleQuestions = false;
    private Boolean shuffleOptions = false;
    private Boolean oneQuestionPerPage = false;
    private Boolean autoSubmit = false;
    private Boolean negativeMarking = false;

    // Scheduling & Access Control
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String lateAccessPolicy; // ALLOW, DISALLOW
    private String visibility; // DRAFT, PUBLISHED

    // Evaluation & Results
    private Boolean showResults = true;
    private Boolean showCorrectAnswers = false;
    private Boolean autoEvaluate = true;

    @ManyToOne
    @JoinColumn(name = "created_by")
    private User createdBy;

    private LocalDateTime createDate;

    @Transient
    @com.fasterxml.jackson.annotation.JsonIgnore
    private List<QuizQuestion> questions; // for JSON serialization

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
    public String getInstructions() {
        return instructions;
    }

    public void setInstructions(String instructions) {
        this.instructions = instructions;
    }

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

    public String getAccessType() {
        return accessType;
    }

    public void setAccessType(String accessType) {
        this.accessType = accessType;
    }

    public Set<User> getAssignedStudents() {
        return assignedStudents;
    }

    public void setAssignedStudents(Set<User> assignedStudents) {
        this.assignedStudents = assignedStudents;
    }

    public Integer getTotalMarks() {
        return totalMarks;
    }

    public void setTotalMarks(Integer totalMarks) {
        this.totalMarks = totalMarks;
    }

    public Integer getPassingMarks() {
        return passingMarks;
    }

    public void setPassingMarks(Integer passingMarks) {
        this.passingMarks = passingMarks;
    }

    public String getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(String difficulty) {
        this.difficulty = difficulty;
    }

    public Integer getTimeLimit() {
        return timeLimit;
    }

    public void setTimeLimit(Integer timeLimit) {
        this.timeLimit = timeLimit;
    }

    public Integer getMaxAttempts() {
        return maxAttempts;
    }

    public void setMaxAttempts(Integer maxAttempts) {
        this.maxAttempts = maxAttempts;
    }

    public Boolean getShuffleQuestions() {
        return shuffleQuestions;
    }

    public void setShuffleQuestions(Boolean shuffleQuestions) {
        this.shuffleQuestions = shuffleQuestions;
    }

    public Boolean getShuffleOptions() {
        return shuffleOptions;
    }

    public void setShuffleOptions(Boolean shuffleOptions) {
        this.shuffleOptions = shuffleOptions;
    }

    public Boolean getOneQuestionPerPage() {
        return oneQuestionPerPage;
    }

    public void setOneQuestionPerPage(Boolean oneQuestionPerPage) {
        this.oneQuestionPerPage = oneQuestionPerPage;
    }

    public Boolean getAutoSubmit() {
        return autoSubmit;
    }

    public void setAutoSubmit(Boolean autoSubmit) {
        this.autoSubmit = autoSubmit;
    }

    public Boolean getNegativeMarking() {
        return negativeMarking;
    }

    public void setNegativeMarking(Boolean negativeMarking) {
        this.negativeMarking = negativeMarking;
    }

    public LocalDateTime getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDateTime startDate) {
        this.startDate = startDate;
    }

    public LocalDateTime getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDateTime endDate) {
        this.endDate = endDate;
    }

    public String getLateAccessPolicy() {
        return lateAccessPolicy;
    }

    public void setLateAccessPolicy(String lateAccessPolicy) {
        this.lateAccessPolicy = lateAccessPolicy;
    }

    public String getVisibility() {
        return visibility;
    }

    public void setVisibility(String visibility) {
        this.visibility = visibility;
    }

    public Boolean getShowResults() {
        return showResults;
    }

    public void setShowResults(Boolean showResults) {
        this.showResults = showResults;
    }

    public Boolean getShowCorrectAnswers() {
        return showCorrectAnswers;
    }

    public void setShowCorrectAnswers(Boolean showCorrectAnswers) {
        this.showCorrectAnswers = showCorrectAnswers;
    }

    public Boolean getAutoEvaluate() {
        return autoEvaluate;
    }

    public void setAutoEvaluate(Boolean autoEvaluate) {
        this.autoEvaluate = autoEvaluate;
    }

    public List<QuizQuestion> getQuestions() {
        return questions;
    }

    public void setQuestions(List<QuizQuestion> questions) {
        this.questions = questions;
    }
}
