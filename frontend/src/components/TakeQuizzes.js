import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './TakeQuizzes.css';

const TakeQuizzes = () => {
    const [quizzes, setQuizzes] = useState([]);
    const [selectedQuiz, setSelectedQuiz] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [quizStarted, setQuizStarted] = useState(false);
    const [quizSubmitted, setQuizSubmitted] = useState(false);
    const [submissionResult, setSubmissionResult] = useState(null);
    const [showOverview, setShowOverview] = useState(true);
    const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [quizStartTime, setQuizStartTime] = useState(null);
    const navigate = useNavigate();

    const buttonStyle = {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '16px',
        transition: 'background 0.3s'
    };

    const timerStyle = {
        position: 'fixed',
        top: '20px',
        right: '20px',
        backgroundColor: timeLeft <= 120 ? '#ff4444' : '#4CAF50',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        fontSize: '18px',
        fontWeight: 'bold',
        zIndex: 1000
    };

    useEffect(() => {
        fetchQuizzes();
    }, []);

    useEffect(() => {
        let timer;
        if (quizStarted && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        handleAutoSubmit();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [quizStarted, timeLeft]);

    const fetchQuizzes = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/student/quizzes');
            setQuizzes(response.data);
        } catch (error) {
            console.error('Error fetching quizzes:', error);
            setQuizzes([]);
        }
    };

    const fetchQuizDetails = async (quizId) => {
        try {
            console.log('Fetching quiz details for quiz ID:', quizId);
            // Need to add endpoint to fetch quiz with questions and options
            const response = await axios.get(`http://localhost:8080/api/student/quizzes/${quizId}/details`);
            console.log('Quiz details response:', response.data);
            console.log('Questions in response:', response.data.questions);
            return response.data;
        } catch (error) {
            console.error('Error fetching quiz details:', error);
            console.error('Error details:', error.response?.data || error.message);
            return null;
        }
    };

    const handleSelectQuiz = async (quiz) => {
        console.log('handleSelectQuiz called with quiz:', quiz);
        setLoading(true);
        setError(null);
        try {
            const quizDetails = await fetchQuizDetails(quiz.id);

            if (quizDetails && quizDetails.questions && quizDetails.questions.length > 0) {
                setSelectedQuiz(quizDetails);
                setShowOverview(true);
            } else {
                setError('This quiz has no questions available. Please contact your teacher.');
                alert('This quiz has no questions available. Please contact your teacher.');
            }
        } catch (err) {
            setError('Failed to load quiz details. Please check your connection and try again.');
            console.error('Error selecting quiz:', err);
            alert('Failed to load quiz details. Please check if the backend server is running.');
        } finally {
            setLoading(false);
        }
    };

    const startQuiz = () => {
        setQuizStarted(true);
        setShowOverview(false);
        setTimeLeft(selectedQuiz.timeLimit * 60); // Convert minutes to seconds
        setCurrentQuestionIndex(0);
        setAnswers({});
        setQuizStartTime(Date.now()); // Track when quiz started
    };

    const handleAnswerChange = (questionId, answer) => {
        console.log(`Answer changed for question ${questionId}:`, answer, `(type: ${typeof answer})`);
        const newAnswers = { ...answers, [questionId]: answer };
        setAnswers(newAnswers);
        console.log('Updated answers:', newAnswers);

        // Auto-save to localStorage
        localStorage.setItem(`quiz_${selectedQuiz.id}_answers`, JSON.stringify(newAnswers));
    };

    const navigateQuestion = (direction) => {
        if (!selectedQuiz || !selectedQuiz.questions) return;
        if (direction === 'next' && currentQuestionIndex < selectedQuiz.questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else if (direction === 'prev' && currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    const handleSubmit = () => {
        setShowSubmitConfirm(true);
    };

    const confirmSubmit = async () => {
        try {
            console.log('Submitting answers:', answers);
            console.log('Answer types:');
            for (const [key, value] of Object.entries(answers)) {
                console.log(`Question ${key}: ${value} (type: ${typeof value})`);
            }

            const response = await axios.post(`http://localhost:8080/api/student/quizzes/${selectedQuiz.id}/submit`, answers);
            console.log('Submission response:', response.data);
            console.log('Response data types:');
            console.log('score:', typeof response.data.score, response.data.score);
            console.log('totalMarks:', typeof response.data.totalMarks, response.data.totalMarks);
            console.log('percentage:', typeof response.data.percentage, response.data.percentage);
            console.log('passed:', typeof response.data.passed, response.data.passed);
            setSubmissionResult(response.data);
            setQuizSubmitted(true);
            setShowSubmitConfirm(false);
            setQuizStarted(false);
            // Clear auto-save
            localStorage.removeItem(`quiz_${selectedQuiz.id}_answers`);
        } catch (error) {
            console.error('Error submitting quiz:', error);
            alert('Error submitting quiz. Please check your connection and try again.');
        }
    };

    const handleAutoSubmit = useCallback(async () => {
        if (quizStarted) {
            try {
                const response = await axios.post(`http://localhost:8080/api/student/quizzes/${selectedQuiz.id}/submit`, answers);
                setSubmissionResult(response.data);
                setQuizSubmitted(true);
                setQuizStarted(false);
                localStorage.removeItem(`quiz_${selectedQuiz.id}_answers`);
                alert('Time is up! Quiz has been auto-submitted.');
            } catch (error) {
                console.error('Error auto-submitting quiz:', error);
                alert('Time is up! Could not submit quiz automatically. Please submit manually.');
                setQuizStarted(false);
                localStorage.removeItem(`quiz_${selectedQuiz.id}_answers`);
            }
        }
    }, [quizStarted, selectedQuiz, answers]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const getCurrentQuestion = () => {
        if (!selectedQuiz || !selectedQuiz.questions || selectedQuiz.questions.length === 0) {
            return null;
        }
        return selectedQuiz.questions[currentQuestionIndex];
    };

    const isAnswered = (questionId) => {
        return answers[questionId] !== undefined;
    };

    const getQuestionStatus = (index) => {
        if (!selectedQuiz || !selectedQuiz.questions || !selectedQuiz.questions[index]) {
            return 'unanswered';
        }
        const questionId = selectedQuiz.questions[index].id;
        return isAnswered(questionId) ? 'answered' : 'unanswered';
    };



    if (quizSubmitted) {
        const timeTaken = Math.floor((Date.now() - quizStartTime) / 1000 / 60); // in minutes
        const timeLeft = selectedQuiz.timeLimit - timeTaken;

        return (
            <div className="results-container">
                <div className="results-content">
                    <div className="results-card">
                        <div className="results-header">
                            <div className="success-icon">✅</div>
                            <h2>Quiz Submitted Successfully</h2>
                            <p>Your quiz has been evaluated automatically</p>
                        </div>

                        <div className="results-body">
                            <div className="quiz-info-header">
                                <h2>{selectedQuiz.title}</h2>
                                <p>{selectedQuiz.subject}</p>
                                <p className="submission-time">Submitted on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}</p>
                            </div>

                            {submissionResult && (
                                <div>
                                    <div className="stats-grid">
                                        <div className="stat-card success">
                                            <div className="stat-value">{submissionResult.score}</div>
                                            <div className="stat-label">Score</div>
                                        </div>

                                        <div className="stat-card">
                                            <div className="stat-value">{submissionResult.percentage}%</div>
                                            <div className="stat-label">Percentage</div>
                                        </div>

                                        <div className={`stat-card ${submissionResult.status === 'PASSED' ? 'success' : 'warning'}`}>
                                            <div className="stat-value">{submissionResult.status === 'PASSED' ? '✅ PASSED' : '❌ FAILED'}</div>
                                            <div className="stat-label">Status</div>
                                        </div>
                                    </div>

                                    <div className="detailed-stats">
                                        <h3 className="stats-title">📊 Quiz Statistics</h3>

                                        <div className="mini-stats-grid">
                                            <div className="mini-stat-card">
                                                <div className="mini-stat-value">{selectedQuiz.questions?.length || 0}</div>
                                                <div className="mini-stat-label">Total Questions</div>
                                            </div>

                                            <div className="mini-stat-card">
                                                <div className="mini-stat-value">{Object.keys(answers).length}</div>
                                                <div className="mini-stat-label">Answered</div>
                                            </div>

                                            <div className="mini-stat-card">
                                                <div className="mini-stat-value">{timeTaken} min</div>
                                                <div className="mini-stat-label">Time Taken</div>
                                            </div>

                                            <div className="mini-stat-card">
                                                <div className="mini-stat-value">{Math.max(0, timeLeft)} min</div>
                                                <div className="mini-stat-label">Time Left</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="results-actions">
                                        <button className="btn" onClick={() => navigate('/student')}>
                                            🏠 Back to Dashboard
                                        </button>

                                        {selectedQuiz.maxAttempts > 1 && (
                                            <button className="btn btn-danger" onClick={() => {
                                                setQuizSubmitted(false);
                                                setQuizStarted(false);
                                                setAnswers({});
                                                setCurrentQuestionIndex(0);
                                                setTimeLeft(selectedQuiz.timeLimit * 60);
                                                localStorage.removeItem(`quiz_${selectedQuiz.id}_answers`);
                                            }}>
                                                🔄 Retake Quiz
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (showSubmitConfirm) {
        return (
            <div className="confirm-modal">
                <div className="confirm-content">
                    <h3>Confirm Submission</h3>
                    <p>Are you sure you want to submit the quiz? This action cannot be undone.</p>
                    <div className="confirm-buttons">
                        <button className="btn btn-success" onClick={confirmSubmit}>Yes, Submit</button>
                        <button className="btn btn-danger" onClick={() => setShowSubmitConfirm(false)}>Cancel</button>
                    </div>
                </div>
            </div>
        );
    }

    if (showOverview && selectedQuiz) {
        return (
            <div className="take-quizzes-container">
                <div className="take-quizzes-content">
                    <div className="quiz-overview">
                        <h1>Quiz Overview</h1>
                        <div className="quiz-info">
                            <h2>{selectedQuiz.title}</h2>
                            <p><strong>Subject:</strong> {selectedQuiz.subject}</p>
                            <p><strong>Teacher:</strong> {selectedQuiz.createdBy?.name || 'N/A'}</p>
                            <p><strong>Total Questions:</strong> {selectedQuiz.questions?.length || 0}</p>
                            <p><strong>Total Marks:</strong> {selectedQuiz.totalMarks}</p>
                            <p><strong>Time Limit:</strong> {selectedQuiz.timeLimit} minutes</p>
                            <p><strong>Attempt Limit:</strong> {selectedQuiz.maxAttempts}</p>
                            <p><strong>Passing Marks:</strong> {selectedQuiz.passingMarks}</p>
                        </div>
                        <div className="quiz-instructions">
                            <h3>Instructions</h3>
                            <p>{selectedQuiz.instructions}</p>
                            <ul>
                                <li>No tab switching allowed</li>
                                <li>Quiz will auto-submit when time runs out</li>
                                <li>One attempt only</li>
                            </ul>
                        </div>
                        <div className="btn-container">
                            <button className="btn" onClick={startQuiz}>Start Quiz</button>
                            <button className="btn btn-secondary" onClick={() => setSelectedQuiz(null)}>Back</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (quizStarted && selectedQuiz) {
        const currentQuestion = getCurrentQuestion();

        // Show loading if questions are not loaded yet
        if (!currentQuestion) {
            return (
                <div className="loading-container">
                    <div>
                        <h2>Loading quiz questions...</h2>
                        <p>Please wait while we load your quiz.</p>
                    </div>
                </div>
            );
        }

        return (
            <div className="take-quizzes-container">
                <div className={`timer ${timeLeft <= 120 ? (timeLeft <= 60 ? 'danger' : 'warning') : ''}`}>
                    {formatTime(timeLeft)}
                </div>
                <div className="take-quizzes-content">
                    <div className="quiz-taking">
                        <div className="quiz-header">
                            <h2>{selectedQuiz.title}</h2>
                            <div className="question-counter">
                                Question {currentQuestionIndex + 1} of {selectedQuiz.questions?.length || 0}
                            </div>
                        </div>

                        <div className="question-card">
                            <div className="question-text">
                                <h3>{currentQuestion.questionText}</h3>
                                <p className="question-marks">{currentQuestion.marks} Marks</p>
                            </div>

                            <div className="options-container">
                                {currentQuestion.questionType === 'MCQ' && (
                                    <div>
                                        {currentQuestion.options.map(option => (
                                            <label
                                                key={option.id}
                                                className={`option ${answers[currentQuestion.id] === option.optionText ? 'selected' : ''}`}
                                            >
                                                <input
                                                    type="radio"
                                                    name={`question-${currentQuestion.id}`}
                                                    value={option.optionText}
                                                    checked={answers[currentQuestion.id] === option.optionText}
                                                    onChange={() => handleAnswerChange(currentQuestion.id, option.optionText)}
                                                />
                                                {option.optionText}
                                            </label>
                                        ))}
                                    </div>
                                )}

                                {currentQuestion.questionType === 'TRUE_FALSE' && (
                                    <div>
                                        <label className={`option ${answers[currentQuestion.id] === true ? 'selected' : ''}`}>
                                            <input
                                                type="radio"
                                                name={`question-${currentQuestion.id}`}
                                                checked={answers[currentQuestion.id] === true}
                                                onChange={() => handleAnswerChange(currentQuestion.id, true)}
                                            />
                                            True
                                        </label>
                                        <label className={`option ${answers[currentQuestion.id] === false ? 'selected' : ''}`}>
                                            <input
                                                type="radio"
                                                name={`question-${currentQuestion.id}`}
                                                checked={answers[currentQuestion.id] === false}
                                                onChange={() => handleAnswerChange(currentQuestion.id, false)}
                                            />
                                            False
                                        </label>
                                    </div>
                                )}

                                {currentQuestion.questionType === 'SHORT_ANSWER' && (
                                    <div>
                                        <textarea
                                            className="textarea-answer"
                                            value={answers[currentQuestion.id] || ''}
                                            onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                                            placeholder="Enter your answer"
                                            maxLength={500}
                                        />
                                        <p className="char-counter">
                                            {answers[currentQuestion.id]?.length || 0}/500 characters
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="navigation-buttons">
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => navigateQuestion('prev')}
                                    disabled={currentQuestionIndex === 0}
                                >
                                    Previous
                                </button>

                                <div>
                                    {selectedQuiz.questions && currentQuestionIndex < selectedQuiz.questions.length - 1 ? (
                                        <button className="btn" onClick={() => navigateQuestion('next')}>
                                            {isAnswered(currentQuestion.id) ? 'Next' : 'Save & Next'}
                                        </button>
                                    ) : (
                                        <button className="btn btn-warning" onClick={handleSubmit}>
                                            Submit Quiz
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Question Palette */}
                        {selectedQuiz.questions && selectedQuiz.questions.length > 0 && (
                            <div className="question-palette">
                                <h4 className="palette-header">Question Palette</h4>
                                <div className="palette-grid">
                                    {selectedQuiz.questions.map((_, index) => (
                                        <button
                                            key={index}
                                            className={`palette-btn ${getQuestionStatus(index)} ${index === currentQuestionIndex ? 'current' : ''}`}
                                            onClick={() => setCurrentQuestionIndex(index)}
                                        >
                                            {index + 1}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="take-quizzes-container">
            <div className="take-quizzes-content">
                <div className="take-quizzes-header">
                    <h1>Take Quizzes</h1>
                </div>
                <h3>Available Quizzes</h3>
                {quizzes.length === 0 ? (
                    <p>No quizzes available.</p>
                ) : (
                    <div className="quiz-list">
                        {quizzes.map(quiz => (
                            <div key={quiz.id} className="quiz-card">
                                <h4>{quiz.title}</h4>
                                <p>{quiz.description}</p>
                                <div className="quiz-details">
                                    <span className="quiz-detail-item">
                                        <strong>Subject:</strong> {quiz.subject}
                                    </span>
                                    <span className="quiz-detail-item">
                                        <strong>Marks:</strong> {quiz.totalMarks}
                                    </span>
                                    <span className="quiz-detail-item">
                                        <strong>Time:</strong> {quiz.timeLimit} min
                                    </span>
                                </div>
                                <p className="quiz-due-date">
                                    <strong>Due:</strong> {quiz.endDate ? new Date(quiz.endDate).toLocaleDateString() : 'No deadline'}
                                </p>
                                <button
                                    className="btn"
                                    onClick={() => handleSelectQuiz(quiz)}
                                    disabled={loading}
                                >
                                    {loading ? 'Loading...' : 'Take Quiz'}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
                <button className="btn back-btn" onClick={() => navigate('/student')}>Back to Dashboard</button>
            </div>
        </div>
    );
};

export default TakeQuizzes;
