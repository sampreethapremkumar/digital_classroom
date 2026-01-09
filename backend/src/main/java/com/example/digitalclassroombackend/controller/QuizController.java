package com.example.digitalclassroombackend.controller;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.digitalclassroombackend.model.Quiz;
import com.example.digitalclassroombackend.model.QuizOption;
import com.example.digitalclassroombackend.model.QuizQuestion;
import com.example.digitalclassroombackend.model.User;
import com.example.digitalclassroombackend.repository.QuizOptionRepository;
import com.example.digitalclassroombackend.repository.QuizQuestionRepository;
import com.example.digitalclassroombackend.repository.QuizRepository;
import com.example.digitalclassroombackend.repository.UserRepository;

@RestController
@RequestMapping("/api/quizzes")
@CrossOrigin(origins = "http://localhost:3000")
public class QuizController {

    @Autowired
    private QuizRepository quizRepository;

    @Autowired
    private QuizQuestionRepository quizQuestionRepository;

    @Autowired
    private QuizOptionRepository quizOptionRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public List<Quiz> getAllQuizzes() {
        return quizRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<?> createQuiz(@RequestBody Quiz quiz) {
        try {
            User user = userRepository.findById(1L).orElse(null);
            quiz.setCreatedBy(user);
            quiz.setCreateDate(java.time.LocalDateTime.now());

            // Handle assigned students - if access type is SELECTED_STUDENTS, convert IDs to User objects
            if ("SELECTED_STUDENTS".equals(quiz.getAccessType()) && quiz.getAssignedStudents() != null) {
                Set<User> assignedUsers = new HashSet<>();
                for (User student : quiz.getAssignedStudents()) {
                    if (student.getId() != null) {
                        User fullUser = userRepository.findById(student.getId()).orElse(null);
                        if (fullUser != null) {
                            assignedUsers.add(fullUser);
                        }
                    }
                }
                quiz.setAssignedStudents(assignedUsers);
            } else {
                // For ALL_CLASS, clear any assigned students
                quiz.setAssignedStudents(new HashSet<>());
            }

            Quiz savedQuiz = quizRepository.save(quiz);
            return ResponseEntity.ok(savedQuiz);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error creating quiz: " + e.getMessage());
        }
    }

    @PostMapping("/{quizId}/questions")
    public ResponseEntity<?> createQuestion(@PathVariable Long quizId, @RequestBody QuizQuestion question) {
        Quiz quiz = quizRepository.findById(quizId).orElse(null);
        if (quiz == null) {
            return ResponseEntity.badRequest().body("Quiz not found");
        }
        question.setQuiz(quiz);
        QuizQuestion savedQuestion = quizQuestionRepository.save(question);
        return ResponseEntity.ok(savedQuestion);
    }

    @PostMapping("/questions/{questionId}/options")
    public ResponseEntity<?> createOption(@PathVariable Long questionId, @RequestBody QuizOption option) {
        QuizQuestion question = quizQuestionRepository.findById(questionId).orElse(null);
        if (question == null) {
            return ResponseEntity.badRequest().body("Question not found");
        }
        option.setQuestion(question);
        QuizOption savedOption = quizOptionRepository.save(option);
        return ResponseEntity.ok(savedOption);
    }

    @PostMapping("/{quizId}/fix-options")
    public ResponseEntity<?> fixQuizOptions(@PathVariable Long quizId) {
        try {
            Quiz quiz = quizRepository.findById(quizId).orElse(null);
            if (quiz == null) {
                return ResponseEntity.badRequest().body("Quiz not found");
            }

            List<QuizQuestion> questions = quizQuestionRepository.findByQuizIdOrderByOrderIndexAsc(quizId);
            int fixedQuestions = 0;

            for (QuizQuestion question : questions) {
                if ("MCQ".equals(question.getQuestionType()) || "TRUE_FALSE".equals(question.getQuestionType())) {
                    List<QuizOption> options = quizOptionRepository.findByQuestionId(question.getId());

                    // Check if any option is already marked as correct
                    boolean hasCorrectOption = options.stream().anyMatch(QuizOption::isCorrect);

                    if (!hasCorrectOption && !options.isEmpty()) {
                        // Randomly mark one option as correct
                        int randomIndex = (int) (Math.random() * options.size());
                        QuizOption optionToFix = options.get(randomIndex);
                        optionToFix.setCorrect(true);
                        quizOptionRepository.save(optionToFix);

                        System.out.println("Fixed question " + question.getId() + ": marked option '" + optionToFix.getOptionText() + "' as correct");
                        fixedQuestions++;
                    }
                }
            }

            return ResponseEntity.ok("Fixed " + fixedQuestions + " questions in quiz " + quizId);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error fixing quiz options: " + e.getMessage());
        }
    }
}
