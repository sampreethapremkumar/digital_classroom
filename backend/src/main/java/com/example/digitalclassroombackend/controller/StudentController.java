package com.example.digitalclassroombackend.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
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
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.digitalclassroombackend.model.Assignment;
import com.example.digitalclassroombackend.model.Grades;
import com.example.digitalclassroombackend.model.Note;
import com.example.digitalclassroombackend.model.Quiz;
import com.example.digitalclassroombackend.model.QuizOption;
import com.example.digitalclassroombackend.model.QuizQuestion;
import com.example.digitalclassroombackend.model.QuizSubmission;
import com.example.digitalclassroombackend.model.Submission;
import com.example.digitalclassroombackend.model.User;
import com.example.digitalclassroombackend.repository.AssignmentRepository;
import com.example.digitalclassroombackend.repository.GradesRepository;
import com.example.digitalclassroombackend.repository.NoteRepository;
import com.example.digitalclassroombackend.repository.QuizOptionRepository;
import com.example.digitalclassroombackend.repository.QuizQuestionRepository;
import com.example.digitalclassroombackend.repository.QuizRepository;
import com.example.digitalclassroombackend.repository.QuizSubmissionRepository;
import com.example.digitalclassroombackend.repository.RubricScoreRepository;
import com.example.digitalclassroombackend.repository.SubmissionRepository;
import com.example.digitalclassroombackend.repository.UserRepository;

@RestController
@RequestMapping("/api/student")
@CrossOrigin(origins = {"http://localhost:3000", "https://digital-classroom-*", "https://*.vercel.app", "https://*.vercel-preview.app"})
public class StudentController {

    @Autowired
    private AssignmentRepository assignmentRepository;

    @Autowired
    private SubmissionRepository submissionRepository;

    @Autowired
    private GradesRepository gradesRepository;

    @Autowired
    private QuizRepository quizRepository;

    @Autowired
    private QuizQuestionRepository quizQuestionRepository;

    @Autowired
    private QuizOptionRepository quizOptionRepository;

    @Autowired
    private QuizSubmissionRepository quizSubmissionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NoteRepository noteRepository;

    @Autowired
    private RubricScoreRepository rubricScoreRepository;

    @GetMapping("/assignments")
    public List<Assignment> getAllAssignments() {
        // For now, return all assignments. In a real app, you might want to filter by student's class/semester
        // and only show assignments that haven't been submitted yet
        return assignmentRepository.findAll();
    }

    @PostMapping(value = "/assignments/{id}/submit", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> submitAssignment(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        Assignment assignment = assignmentRepository.findById(id).orElse(null);
        if (assignment == null) return ResponseEntity.badRequest().body("Assignment not found");
        User user = userRepository.findById(1L).orElse(null); // Assuming student id 1 for now
        Submission submission = new Submission();
        submission.setAssignment(assignment);
        submission.setSubmittedBy(user);
        submission.setSubmitDate(LocalDateTime.now());

        if (!file.isEmpty()) {
            try {
                String fileName = file.getOriginalFilename();
                String uploadDir = "uploads/submissions/";
                Path uploadPath = Paths.get(uploadDir);
                if (!Files.exists(uploadPath)) {
                    Files.createDirectories(uploadPath);
                }
                Path filePath = uploadPath.resolve(fileName);
                Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
                submission.setFilePath(filePath.toString());
                submission.setFileName(fileName);
                submission.setFileType(file.getContentType());
            } catch (IOException e) {
                return ResponseEntity.status(500).body("File upload failed");
            }
        }
        submissionRepository.save(submission);
        return ResponseEntity.ok("Assignment submitted successfully");
    }

    @GetMapping("/quizzes")
    public List<Quiz> getAllQuizzes() {
        return quizRepository.findAll();
    }

    @GetMapping("/quizzes/{id}/details")
    public ResponseEntity<?> getQuizDetails(@PathVariable Long id) {
        System.out.println("Getting quiz details for quiz ID: " + id);
        Quiz quiz = quizRepository.findById(id).orElse(null);
        if (quiz == null) {
            System.out.println("Quiz not found for ID: " + id);
            return ResponseEntity.badRequest().body("Quiz not found");
        }
        System.out.println("Found quiz: " + quiz.getTitle());

        // Fetch questions with options
        List<QuizQuestion> questions = quizQuestionRepository.findByQuizIdOrderByOrderIndexAsc(id);
        System.out.println("Found " + questions.size() + " questions for quiz ID: " + id);

        // Debug: Check if questions exist in database at all
        List<QuizQuestion> allQuestions = quizQuestionRepository.findAll();
        System.out.println("Total questions in database: " + allQuestions.size());
        for (QuizQuestion q : allQuestions) {
            System.out.println("Question ID: " + q.getId() + ", Quiz ID: " + (q.getQuiz() != null ? q.getQuiz().getId() : "null"));
        }

        // Create a custom response map to avoid circular references
        Map<String, Object> response = new HashMap<>();
        response.put("id", quiz.getId());
        response.put("title", quiz.getTitle());
        response.put("description", quiz.getDescription());
        response.put("instructions", quiz.getInstructions());
        response.put("subject", quiz.getSubject());
        response.put("classSemester", quiz.getClassSemester());
        response.put("accessType", quiz.getAccessType());
        response.put("totalMarks", quiz.getTotalMarks());
        response.put("passingMarks", quiz.getPassingMarks());
        response.put("difficulty", quiz.getDifficulty());
        response.put("timeLimit", quiz.getTimeLimit());
        response.put("maxAttempts", quiz.getMaxAttempts());
        response.put("shuffleQuestions", quiz.getShuffleQuestions());
        response.put("shuffleOptions", quiz.getShuffleOptions());
        response.put("oneQuestionPerPage", quiz.getOneQuestionPerPage());
        response.put("autoSubmit", quiz.getAutoSubmit());
        response.put("negativeMarking", quiz.getNegativeMarking());
        response.put("startDate", quiz.getStartDate());
        response.put("endDate", quiz.getEndDate());
        response.put("lateAccessPolicy", quiz.getLateAccessPolicy());
        response.put("visibility", quiz.getVisibility());
        response.put("showResults", quiz.getShowResults());
        response.put("showCorrectAnswers", quiz.getShowCorrectAnswers());
        response.put("autoEvaluate", quiz.getAutoEvaluate());
        response.put("createDate", quiz.getCreateDate());

        // Add questions with options
        List<Map<String, Object>> questionList = new ArrayList<>();
        for (QuizQuestion question : questions) {
            Map<String, Object> questionMap = new HashMap<>();
            questionMap.put("id", question.getId());
            questionMap.put("questionText", question.getQuestionText());
            questionMap.put("questionType", question.getQuestionType());
            questionMap.put("marks", question.getMarks());
            questionMap.put("orderIndex", question.getOrderIndex());

            // Add options for MCQ and TRUE_FALSE questions
            List<QuizOption> options = quizOptionRepository.findByQuestionId(question.getId());
            List<Map<String, Object>> optionList = new ArrayList<>();
            for (QuizOption option : options) {
                Map<String, Object> optionMap = new HashMap<>();
                optionMap.put("id", option.getId());
                optionMap.put("optionText", option.getOptionText());
                optionMap.put("isCorrect", option.isCorrect());
                optionList.add(optionMap);
            }
            questionMap.put("options", optionList);
            questionList.add(questionMap);
        }
        response.put("questions", questionList);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/quizzes/{id}/submit")
    public ResponseEntity<?> submitQuiz(@PathVariable Long id, @RequestBody Map<String, Object> answers) {
        Quiz quiz = quizRepository.findById(id).orElse(null);
        if (quiz == null) return ResponseEntity.badRequest().body("Quiz not found");
        User user = userRepository.findById(1L).orElse(null); // Assuming student id 1 for now
        QuizSubmission quizSubmission = new QuizSubmission();
        quizSubmission.setQuiz(quiz);
        quizSubmission.setSubmittedBy(user);
        quizSubmission.setSubmitDate(LocalDateTime.now());

        // Convert answers to JSON string for storage
        try {
            String answersJson = new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(answers);
            quizSubmission.setAnswers(answersJson);
        } catch (Exception e) {
            quizSubmission.setAnswers("{}");
        }

        // Auto-evaluate objective questions
        double score = 0.0;
        System.out.println("Evaluating quiz submission. Total questions answered: " + answers.size());
        System.out.println("Quiz total marks: " + quiz.getTotalMarks());
        System.out.println("Answers received: " + answers);

        // Debug: Check what questions exist for this quiz
        List<QuizQuestion> quizQuestions = quizQuestionRepository.findByQuizIdOrderByOrderIndexAsc(quiz.getId());
        System.out.println("Total questions in quiz: " + quizQuestions.size());
        for (QuizQuestion q : quizQuestions) {
            System.out.println("Question ID: " + q.getId() + ", Type: " + q.getQuestionType() + ", Marks: " + q.getMarks());
            List<QuizOption> options = quizOptionRepository.findByQuestionId(q.getId());
            System.out.println("  Options for question " + q.getId() + ": " + options.size());
            for (QuizOption opt : options) {
                System.out.println("    Option ID: " + opt.getId() + ", Text: '" + opt.getOptionText() + "', Correct: " + opt.isCorrect());
            }
        }

        for (String questionIdStr : answers.keySet()) {
            try {
                Long questionId = Long.parseLong(questionIdStr);
                QuizQuestion question = quizQuestionRepository.findById(questionId).orElse(null);
                if (question != null) {
                    Object answer = answers.get(questionIdStr);
                    System.out.println("Evaluating question ID: " + questionId + ", Type: " + question.getQuestionType() + ", Marks: " + question.getMarks() + ", Answer: " + answer + " (type: " + answer.getClass().getSimpleName() + ")");

                    if ("MCQ".equals(question.getQuestionType())) {
                        // Compare student's selected option text with stored correct answer text
                        if (answer instanceof String) {
                            String studentAnswer = (String) answer;
                            String correctAnswer = question.getCorrectAnswerText();
                            System.out.println("MCQ comparison: Student='" + studentAnswer + "', Correct='" + correctAnswer + "'");

                            if (studentAnswer != null && correctAnswer != null && studentAnswer.trim().equalsIgnoreCase(correctAnswer.trim())) {
                                score += question.getMarks();
                                System.out.println("✓ Correct MCQ answer! Added " + question.getMarks() + " marks. Current score: " + score);
                            } else {
                                System.out.println("✗ Incorrect MCQ answer");
                            }
                        } else {
                            System.out.println("MCQ Answer is not a string: " + answer + " (type: " + answer.getClass().getSimpleName() + ")");
                        }
                    } else if ("TRUE_FALSE".equals(question.getQuestionType())) {
                        // Handle boolean values from JSON
                        Boolean studentAnswer = null;
                        if (answer instanceof Boolean) {
                            studentAnswer = (Boolean) answer;
                        } else if (answer instanceof String) {
                            studentAnswer = Boolean.parseBoolean((String) answer);
                        }

                        if (studentAnswer != null) {
                            // For TRUE_FALSE, check if the student's boolean answer matches any correct option
                            List<QuizOption> options = quizOptionRepository.findByQuestionId(question.getId());
                            System.out.println("TRUE_FALSE question has " + options.size() + " options");

                            boolean isCorrect = false;
                            for (QuizOption option : options) {
                                if (option.isCorrect()) {
                                    boolean correctAnswer = "True".equalsIgnoreCase(option.getOptionText()) ||
                                                           "Yes".equalsIgnoreCase(option.getOptionText());
                                    System.out.println("Correct option: '" + option.getOptionText() + "', correctAnswer: " + correctAnswer + ", studentAnswer: " + studentAnswer);

                                    if (correctAnswer == studentAnswer) {
                                        isCorrect = true;
                                        break;
                                    }
                                }
                            }

                            if (isCorrect) {
                                score += question.getMarks();
                                System.out.println("Correct TRUE_FALSE answer! Added " + question.getMarks() + " marks. Current score: " + score);
                            } else {
                                System.out.println("Incorrect TRUE_FALSE answer. Student: " + studentAnswer);
                            }
                        } else {
                            System.out.println("TRUE_FALSE Answer could not be parsed as boolean: " + answer + " (type: " + answer.getClass().getSimpleName() + ")");
                        }
                    } else if ("SHORT_ANSWER".equals(question.getQuestionType())) {
                        // For short answer, basic text matching (case insensitive)
                        if (answer != null && question.getCorrectAnswer() != null) {
                            String studentAnswer = answer.toString().trim().toLowerCase();
                            String correctAnswer = question.getCorrectAnswer().trim().toLowerCase();
                            System.out.println("Short answer - Student: '" + studentAnswer + "', Correct: '" + correctAnswer + "'");
                            if (studentAnswer.equals(correctAnswer)) {
                                score += question.getMarks();
                                System.out.println("Correct short answer! Added " + question.getMarks() + " marks. Current score: " + score);
                            }
                        } else {
                            System.out.println("SHORT_ANSWER: Missing answer or correct answer. Answer: " + answer + ", Correct: " + question.getCorrectAnswer());
                        }
                    }
                } else {
                    System.out.println("Question not found for ID: " + questionId);
                }
            } catch (Exception e) {
                System.out.println("Error evaluating question " + questionIdStr + ": " + e.getMessage());
                e.printStackTrace();
            }
        }

        System.out.println("Final score: " + score + " out of " + quiz.getTotalMarks());

        // Ensure score is not NaN or infinite
        if (Double.isNaN(score) || Double.isInfinite(score)) {
            score = 0.0;
        }

        // Calculate percentage safely
        double totalMarks = quiz.getTotalMarks() != null ? quiz.getTotalMarks().doubleValue() : 0.0;
        double percentage = totalMarks > 0 ? (score / totalMarks) * 100 : 0.0;

        // Ensure percentage is not NaN or infinite
        if (Double.isNaN(percentage) || Double.isInfinite(percentage)) {
            percentage = 0.0;
        }

        // Count total questions and correct answers
        int totalQuestions = quizQuestions.size();
        int correctAnswers = (int) Math.round(score); // Since each question is worth 1 mark

        System.out.println("Total questions: " + totalQuestions);
        System.out.println("Correct answers: " + correctAnswers);
        System.out.println("Calculated percentage: " + percentage + "%");
        System.out.println("Passing marks: " + quiz.getPassingMarks());
        System.out.println("Status: " + (percentage >= quiz.getPassingMarks() ? "PASSED" : "FAILED"));

        quizSubmission.setScore(score);
        quizSubmissionRepository.save(quizSubmission);

        // Return submission result in the requested format
        Map<String, Object> result = new HashMap<>();
        result.put("totalQuestions", totalQuestions);
        result.put("correctAnswers", correctAnswers);
        result.put("score", correctAnswers); // Score is the number of correct answers
        result.put("percentage", Math.round(percentage)); // Round to nearest integer
        result.put("status", percentage >= quiz.getPassingMarks() ? "PASSED" : "FAILED");

        System.out.println("Returning result: " + result);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/grades")
    public List<Map<String, Object>> getGrades() {
        try {
            // Get current authenticated user
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null) {
                return new ArrayList<>(); // Return empty list if not authenticated
            }

            String username = authentication.getName();
            User student = userRepository.findByUsername(username).orElse(null);

            if (student == null || !"STUDENT".equals(student.getRole().name())) {
                return new ArrayList<>(); // Return empty list if not a student
            }

            // Get all published grades for this student
            List<Grades> grades = gradesRepository.findAll().stream()
                    .filter(g -> g.getSubmission().getSubmittedBy().getId().equals(student.getId()))
                    .filter(g -> g.getStatus() == Grades.GradeStatus.PUBLISHED)
                    .collect(java.util.stream.Collectors.toList());

        return grades.stream().map(grade -> {
            Map<String, Object> gradeMap = new HashMap<>();
            gradeMap.put("id", grade.getId());
            gradeMap.put("marks", grade.getMarks());
            gradeMap.put("feedback", grade.getFeedback());
            gradeMap.put("gradedAt", grade.getGradedAt());

            // Add submission details
            Map<String, Object> submissionMap = new HashMap<>();
            submissionMap.put("id", grade.getSubmission().getId());
            submissionMap.put("submitDate", grade.getSubmission().getSubmitDate());
            submissionMap.put("fileName", grade.getSubmission().getFileName());

            // Add assignment details
            Map<String, Object> assignmentMap = new HashMap<>();
            assignmentMap.put("id", grade.getSubmission().getAssignment().getId());
            assignmentMap.put("title", grade.getSubmission().getAssignment().getTitle());
            assignmentMap.put("totalMarks", grade.getSubmission().getAssignment().getTotalMarks());
            submissionMap.put("assignment", assignmentMap);

            // Add rubric scores if any
            List<Map<String, Object>> rubricScores = rubricScoreRepository.findBySubmissionId(grade.getSubmission().getId())
                .stream().map(score -> {
                    Map<String, Object> scoreMap = new HashMap<>();
                    scoreMap.put("id", score.getId());
                    scoreMap.put("score", score.getScore());
                    scoreMap.put("comments", score.getComments());

                    // Add criteria details
                    Map<String, Object> criteriaMap = new HashMap<>();
                    criteriaMap.put("id", score.getCriteria().getId());
                    criteriaMap.put("criteriaName", score.getCriteria().getCriteriaName());
                    criteriaMap.put("maxPoints", score.getCriteria().getMaxPoints());
                    scoreMap.put("criteria", criteriaMap);

                    return scoreMap;
                }).collect(java.util.stream.Collectors.toList());

            submissionMap.put("rubricScores", rubricScores);
            gradeMap.put("submission", submissionMap);

            return gradeMap;
        }).collect(java.util.stream.Collectors.toList());

        } catch (Exception e) {
            System.err.println("Error fetching grades: " + e.getMessage());
            return new ArrayList<>(); // Return empty list on error
        }
    }

    @GetMapping("/notes")
    public List<Note> getAllNotes() {
        return noteRepository.findAll();
    }

    @GetMapping("/stats")
    public Map<String, Long> getStudentStats() {
        // Assuming student id 1 for now
        Long studentId = 1L;

        // Notes Available: total notes uploaded by teachers
        long notesAvailable = noteRepository.count();

        // Assignments Pending: assignments not yet submitted by this student and not past due date
        LocalDateTime now = LocalDateTime.now();
        long assignmentsPending = assignmentRepository.findAll().stream()
                .filter(assignment -> assignment.getDueDate() != null && !assignment.getDueDate().isBefore(now))
                .filter(assignment -> submissionRepository.findAll().stream()
                        .noneMatch(sub -> sub.getAssignment().getId().equals(assignment.getId()) &&
                                       sub.getSubmittedBy().getId().equals(studentId)))
                .count();

        // Quizzes Available: quizzes not yet taken by this student
        long quizzesAvailable = quizRepository.findAll().stream()
                .filter(quiz -> quizSubmissionRepository.findAll().stream()
                        .noneMatch(sub -> sub.getQuiz().getId().equals(quiz.getId()) &&
                                       sub.getSubmittedBy().getId().equals(studentId)))
                .count();

        // Grades Published: grades given to this student's submissions
        long gradesPublished = gradesRepository.findAll().stream()
                .filter(grade -> grade.getSubmission().getSubmittedBy().getId().equals(studentId))
                .count();

        Map<String, Long> stats = new HashMap<>();
        stats.put("notesAvailable", notesAvailable);
        stats.put("assignmentsPending", assignmentsPending);
        stats.put("quizzesAvailable", quizzesAvailable);
        stats.put("gradesPublished", gradesPublished);

        return stats;
    }
}
