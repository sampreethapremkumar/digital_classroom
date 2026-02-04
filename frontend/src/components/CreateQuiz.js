import React, { useState, useEffect } from 'react';
import axios from '../api';
import { useNavigate } from 'react-router-dom';

const CreateQuiz = () => {
    const navigate = useNavigate();

    // Quiz Basic Info
    const [quizData, setQuizData] = useState({
        title: '',
        description: '',
        instructions: '',
        subject: '',
        classSemester: '',
        accessType: 'ALL_CLASS',
        totalMarks: 0,
        passingMarks: 0,
        difficulty: 'MEDIUM',
        timeLimit: 30,
        maxAttempts: 1,
        shuffleQuestions: false,
        shuffleOptions: false,
        oneQuestionPerPage: false,
        autoSubmit: true,
        negativeMarking: false,
        startDate: '',
        endDate: '',
        lateAccessPolicy: 'ALLOW',
        visibility: 'DRAFT',
        showResults: true,
        showCorrectAnswers: false,
        autoEvaluate: true
    });

    // Students for selection
    const [allStudents, setAllStudents] = useState([]);
    const [selectedStudents, setSelectedStudents] = useState([]);

    // Questions management
    const [questions, setQuestions] = useState([]);

    // Current question being edited
    const [currentQuestion, setCurrentQuestion] = useState({
        questionText: '',
        questionType: 'MCQ',
        marks: 1,
        options: ['', '', '', ''], // for MCQ
        correctAnswer: '', // for short answer
        correctOptionIndex: -1 // for MCQ
    });

    // UI states
    const [isLoading, setIsLoading] = useState(false);
    const [showQuestionForm, setShowQuestionForm] = useState(false);
    const [editingQuestionIndex, setEditingQuestionIndex] = useState(-1);

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const response = await axios.get('/api/auth/students');
            setAllStudents(response.data);
        } catch (error) {
            console.error('Error fetching students:', error);
        }
    };

    const updateQuizData = (field, value) => {
        setQuizData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const calculateTotalMarks = () => {
        return questions.reduce((total, q) => total + q.marks, 0);
    };

    const addQuestion = () => {
        if (!currentQuestion.questionText.trim()) {
            alert('Please enter question text');
            return;
        }

        if (currentQuestion.questionType === 'MCQ') {
            if (currentQuestion.options.some(opt => !opt.trim())) {
                alert('Please fill all options for MCQ');
                return;
            }
            if (currentQuestion.correctOptionIndex === -1) {
                alert('Please select the correct answer');
                return;
            }
        } else if (currentQuestion.questionType === 'SHORT_ANSWER') {
            if (!currentQuestion.correctAnswer.trim()) {
                alert('Please provide the correct answer');
                return;
            }
        }

        const newQuestion = {
            ...currentQuestion,
            id: Date.now(), // temporary ID
            orderIndex: questions.length
        };

        if (editingQuestionIndex >= 0) {
            const updatedQuestions = [...questions];
            updatedQuestions[editingQuestionIndex] = newQuestion;
            setQuestions(updatedQuestions);
        } else {
            setQuestions([...questions, newQuestion]);
        }

        // Reset form
        setCurrentQuestion({
            questionText: '',
            questionType: 'MCQ',
            marks: 1,
            options: ['', '', '', ''],
            correctAnswer: '',
            correctOptionIndex: -1
        });
        setShowQuestionForm(false);
        setEditingQuestionIndex(-1);

        // Update total marks
        updateQuizData('totalMarks', calculateTotalMarks() + newQuestion.marks);
    };

    const editQuestion = (index) => {
        setCurrentQuestion(questions[index]);
        setEditingQuestionIndex(index);
        setShowQuestionForm(true);
    };

    const deleteQuestion = (index) => {
        const updatedQuestions = questions.filter((_, i) => i !== index);
        setQuestions(updatedQuestions);
        updateQuizData('totalMarks', calculateTotalMarks() - questions[index].marks);
    };

    const handleStudentSelection = (studentId) => {
        setSelectedStudents(prev =>
            prev.includes(studentId)
                ? prev.filter(id => id !== studentId)
                : [...prev, studentId]
        );
    };

    const handleSubmit = async () => {
        if (!quizData.title.trim()) {
            alert('Please enter quiz title');
            return;
        }

        if (questions.length === 0) {
            alert('Please add at least one question');
            return;
        }

        setIsLoading(true);

        try {
            // Prepare quiz data
            const quizPayload = {
                ...quizData,
                assignedStudents: selectedStudents.map(id => ({ id: id })),
                startDate: quizData.startDate ? new Date(quizData.startDate).toISOString() : null,
                endDate: quizData.endDate ? new Date(quizData.endDate).toISOString() : null,
                createDate: new Date().toISOString()
            };

            console.log('Sending quiz data:', quizPayload);
            // Create quiz first
            const quizResponse = await axios.post('/api/quizzes', quizPayload);
            console.log('Quiz creation response:', quizResponse);
            const quizId = quizResponse.data.id;

            // Create questions
            for (const question of questions) {
                try {
                    const questionPayload = {
                        questionText: question.questionText,
                        questionType: question.questionType,
                        marks: question.marks,
                        correctAnswer: question.correctAnswer,
                        correctAnswerText: question.questionType === 'MCQ'
                            ? question.options[question.correctOptionIndex]
                            : question.correctAnswer,
                        orderIndex: question.orderIndex
                    };

                    console.log('Creating question:', questionPayload);
                    const questionResponse = await axios.post(`/api/quizzes/${quizId}/questions`, questionPayload);
                    const questionId = questionResponse.data.id;
                    console.log('Question created with ID:', questionId);

                    // Create options for MCQ and TRUE_FALSE
                    if (question.questionType === 'MCQ') {
                        console.log(`Creating MCQ options for question ${questionId}, correctOptionIndex: ${question.correctOptionIndex}`);
                        for (let i = 0; i < question.options.length; i++) {
                            const isCorrect = i === question.correctOptionIndex;
                            console.log(`Option ${i}: "${question.options[i]}" - isCorrect: ${isCorrect}`);
                            try {
                                await axios.post(`/api/quizzes/questions/${questionId}/options`, {
                                    optionText: question.options[i],
                                    isCorrect: isCorrect
                                });
                                console.log(`✓ Option ${i} created for MCQ question ${questionId}: "${question.options[i]}" (correct: ${isCorrect})`);
                            } catch (optionError) {
                                console.error('Error creating option:', optionError);
                                alert(`Error creating option for question: ${optionError.message}`);
                            }
                        }
                    } else if (question.questionType === 'TRUE_FALSE') {
                        // Create True and False options for TRUE_FALSE questions
                        console.log(`Creating TRUE_FALSE options for question ${questionId}, correctAnswer: "${question.correctAnswer}"`);
                        const options = [
                            { text: 'True', isCorrect: question.correctAnswer === 'True' },
                            { text: 'False', isCorrect: question.correctAnswer === 'False' }
                        ];

                        for (const option of options) {
                            console.log(`TRUE_FALSE Option: "${option.text}" - isCorrect: ${option.isCorrect}`);
                            try {
                                await axios.post(`/api/quizzes/questions/${questionId}/options`, {
                                    optionText: option.text,
                                    isCorrect: option.isCorrect
                                });
                                console.log(`✓ TRUE_FALSE option created: "${option.text}" (correct: ${option.isCorrect})`);
                            } catch (optionError) {
                                console.error('Error creating TRUE_FALSE option:', optionError);
                                alert(`Error creating option for TRUE_FALSE question: ${optionError.message}`);
                            }
                        }
                    }
                } catch (questionError) {
                    console.error('Error creating question:', questionError);
                    alert(`Error creating question: ${questionError.message}`);
                    throw questionError; // Re-throw to stop the process
                }
            }

            alert('Quiz created successfully!');
            navigate('/teacher');
        } catch (error) {
            console.error('Error creating quiz:', error);
            alert('Error creating quiz. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const fixExistingQuiz = async (quizId) => {
        try {
            const response = await axios.post(`/api/quizzes/${quizId}/fix-options`);
            alert(`Fixed ${response.data} questions in quiz ${quizId}`);
            console.log('Fixed quiz options:', response.data);
        } catch (error) {
            console.error('Error fixing quiz:', error);
            alert('Error fixing quiz options');
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '40px',
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        }}>
            <div style={{
                maxWidth: '1400px',
                margin: '0 auto',
                display: 'grid',
                gridTemplateColumns: '1fr 300px',
                gap: '30px'
            }}>
                {/* Main Content */}
                <div style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '20px',
                    padding: '40px',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                    <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                        <h1 style={{
                            margin: '0 0 10px 0',
                            fontSize: '36px',
                            fontWeight: '800',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            letterSpacing: '-1px'
                        }}>
                            📝 Create Quiz
                        </h1>
                        <p style={{
                            margin: 0,
                            color: '#666',
                            fontSize: '16px',
                            fontWeight: '500'
                        }}>
                            Build comprehensive quizzes with multiple question types
                        </p>
                    </div>

                    {/* Quiz Basic Info */}
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                        borderRadius: '15px',
                        padding: '25px',
                        marginBottom: '30px',
                        border: '1px solid rgba(102, 126, 234, 0.2)'
                    }}>
                        <h2 style={{
                            margin: '0 0 20px 0',
                            color: '#2c3e50',
                            fontSize: '24px',
                            fontWeight: '700',
                            borderBottom: '3px solid #667eea',
                            paddingBottom: '10px'
                        }}>
                            📋 Quiz Information
                        </h2>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '8px',
                                    color: '#2c3e50',
                                    fontSize: '16px',
                                    fontWeight: '600'
                                }}>
                                    Quiz Title *
                                </label>
                                <input
                                    type="text"
                                    value={quizData.title}
                                    onChange={(e) => updateQuizData('title', e.target.value)}
                                    placeholder="Enter quiz title"
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        border: '2px solid rgba(102, 126, 234, 0.2)',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        background: 'rgba(255, 255, 255, 0.8)'
                                    }}
                                />
                            </div>

                            <div>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '8px',
                                    color: '#2c3e50',
                                    fontSize: '16px',
                                    fontWeight: '600'
                                }}>
                                    Subject
                                </label>
                                <select
                                    value={quizData.subject}
                                    onChange={(e) => updateQuizData('subject', e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        border: '2px solid rgba(102, 126, 234, 0.2)',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        background: 'rgba(255, 255, 255, 0.8)'
                                    }}
                                >
                                    <option value="">Select Subject</option>
                                    <option value="Java">Java</option>
                                    <option value="DBMS">DBMS</option>
                                    <option value="OS">Operating Systems</option>
                                    <option value="CN">Computer Networks</option>
                                    <option value="DSA">Data Structures</option>
                                    <option value="Web Development">Web Development</option>
                                </select>
                            </div>

                            <div>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '8px',
                                    color: '#2c3e50',
                                    fontSize: '16px',
                                    fontWeight: '600'
                                }}>
                                    Class/Semester
                                </label>
                                <select
                                    value={quizData.classSemester}
                                    onChange={(e) => updateQuizData('classSemester', e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        border: '2px solid rgba(102, 126, 234, 0.2)',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        background: 'rgba(255, 255, 255, 0.8)'
                                    }}
                                >
                                    <option value="">Select Class</option>
                                    <option value="CS1">CS Semester 1</option>
                                    <option value="CS2">CS Semester 2</option>
                                    <option value="CS3">CS Semester 3</option>
                                    <option value="CS4">CS Semester 4</option>
                                    <option value="CS5">CS Semester 5</option>
                                    <option value="CS6">CS Semester 6</option>
                                    <option value="CS7">CS Semester 7</option>
                                    <option value="CS8">CS Semester 8</option>
                                </select>
                            </div>

                            <div>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '8px',
                                    color: '#2c3e50',
                                    fontSize: '16px',
                                    fontWeight: '600'
                                }}>
                                    Difficulty Level
                                </label>
                                <select
                                    value={quizData.difficulty}
                                    onChange={(e) => updateQuizData('difficulty', e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        border: '2px solid rgba(102, 126, 234, 0.2)',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        background: 'rgba(255, 255, 255, 0.8)'
                                    }}
                                >
                                    <option value="EASY">Easy</option>
                                    <option value="MEDIUM">Medium</option>
                                    <option value="HARD">Hard</option>
                                </select>
                            </div>
                        </div>

                        <div style={{ marginTop: '20px' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '8px',
                                color: '#2c3e50',
                                fontSize: '16px',
                                fontWeight: '600'
                            }}>
                                Description
                            </label>
                            <textarea
                                value={quizData.description}
                                onChange={(e) => updateQuizData('description', e.target.value)}
                                placeholder="Brief description of the quiz"
                                rows="3"
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    border: '2px solid rgba(102, 126, 234, 0.2)',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    background: 'rgba(255, 255, 255, 0.8)',
                                    resize: 'vertical'
                                }}
                            />
                        </div>

                        <div style={{ marginTop: '20px' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '8px',
                                color: '#2c3e50',
                                fontSize: '16px',
                                fontWeight: '600'
                            }}>
                                Instructions
                            </label>
                            <textarea
                                value={quizData.instructions}
                                onChange={(e) => updateQuizData('instructions', e.target.value)}
                                placeholder="Quiz rules and guidelines for students"
                                rows="4"
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    border: '2px solid rgba(102, 126, 234, 0.2)',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    background: 'rgba(255, 255, 255, 0.8)',
                                    resize: 'vertical'
                                }}
                            />
                        </div>
                    </div>

                    {/* Quiz Settings */}
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(67, 233, 123, 0.1) 0%, rgba(56, 249, 215, 0.1) 100%)',
                        borderRadius: '15px',
                        padding: '25px',
                        marginBottom: '30px',
                        border: '1px solid rgba(67, 233, 123, 0.2)'
                    }}>
                        <h2 style={{
                            margin: '0 0 20px 0',
                            color: '#2c3e50',
                            fontSize: '24px',
                            fontWeight: '700',
                            borderBottom: '3px solid #43e97b',
                            paddingBottom: '10px'
                        }}>
                            ⚙️ Quiz Settings
                        </h2>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                            <div>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '8px',
                                    color: '#2c3e50',
                                    fontSize: '14px',
                                    fontWeight: '600'
                                }}>
                                    Time Limit (minutes)
                                </label>
                                <input
                                    type="number"
                                    min="5"
                                    max="180"
                                    value={quizData.timeLimit}
                                    onChange={(e) => updateQuizData('timeLimit', parseInt(e.target.value))}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        border: '2px solid rgba(67, 233, 123, 0.2)',
                                        borderRadius: '6px',
                                        fontSize: '14px',
                                        background: 'rgba(255, 255, 255, 0.8)'
                                    }}
                                />
                            </div>

                            <div>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '8px',
                                    color: '#2c3e50',
                                    fontSize: '14px',
                                    fontWeight: '600'
                                }}>
                                    Max Attempts
                                </label>
                                <select
                                    value={quizData.maxAttempts}
                                    onChange={(e) => updateQuizData('maxAttempts', parseInt(e.target.value))}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        border: '2px solid rgba(67, 233, 123, 0.2)',
                                        borderRadius: '6px',
                                        fontSize: '14px',
                                        background: 'rgba(255, 255, 255, 0.8)'
                                    }}
                                >
                                    <option value={1}>Single Attempt</option>
                                    <option value={2}>2 Attempts</option>
                                    <option value={3}>3 Attempts</option>
                                    <option value={999}>Unlimited</option>
                                </select>
                            </div>

                            <div>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '8px',
                                    color: '#2c3e50',
                                    fontSize: '14px',
                                    fontWeight: '600'
                                }}>
                                    Passing Marks
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={quizData.passingMarks}
                                    onChange={(e) => updateQuizData('passingMarks', parseInt(e.target.value))}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        border: '2px solid rgba(67, 233, 123, 0.2)',
                                        borderRadius: '6px',
                                        fontSize: '14px',
                                        background: 'rgba(255, 255, 255, 0.8)'
                                    }}
                                />
                            </div>
                        </div>

                        <div style={{ marginTop: '20px' }}>
                            <h3 style={{
                                margin: '0 0 15px 0',
                                color: '#2c3e50',
                                fontSize: '18px',
                                fontWeight: '600'
                            }}>
                                Quiz Behavior
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
                                {[
                                    { key: 'shuffleQuestions', label: 'Shuffle Questions' },
                                    { key: 'shuffleOptions', label: 'Shuffle Options' },
                                    { key: 'oneQuestionPerPage', label: 'One Question/Page' },
                                    { key: 'autoSubmit', label: 'Auto-submit on Time' },
                                    { key: 'negativeMarking', label: 'Negative Marking' }
                                ].map(setting => (
                                    <label key={setting.key} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        fontWeight: '500'
                                    }}>
                                        <input
                                            type="checkbox"
                                            checked={quizData[setting.key]}
                                            onChange={(e) => updateQuizData(setting.key, e.target.checked)}
                                            style={{ marginRight: '8px' }}
                                        />
                                        {setting.label}
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Student Assignment */}
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 87, 34, 0.1) 100%)',
                        borderRadius: '15px',
                        padding: '25px',
                        marginBottom: '30px',
                        border: '1px solid rgba(255, 193, 7, 0.2)'
                    }}>
                        <h2 style={{
                            margin: '0 0 20px 0',
                            color: '#2c3e50',
                            fontSize: '24px',
                            fontWeight: '700',
                            borderBottom: '3px solid #ffc107',
                            paddingBottom: '10px'
                        }}>
                            👥 Student Assignment
                        </h2>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '10px',
                                color: '#2c3e50',
                                fontSize: '16px',
                                fontWeight: '600'
                            }}>
                                Access Type
                            </label>
                            <div style={{ display: 'flex', gap: '20px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                    <input
                                        type="radio"
                                        name="accessType"
                                        value="ALL_CLASS"
                                        checked={quizData.accessType === 'ALL_CLASS'}
                                        onChange={(e) => updateQuizData('accessType', e.target.value)}
                                        style={{ marginRight: '8px' }}
                                    />
                                    All students in class
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                    <input
                                        type="radio"
                                        name="accessType"
                                        value="SELECTED_STUDENTS"
                                        checked={quizData.accessType === 'SELECTED_STUDENTS'}
                                        onChange={(e) => updateQuizData('accessType', e.target.value)}
                                        style={{ marginRight: '8px' }}
                                    />
                                    Selected students only
                                </label>
                            </div>
                        </div>

                        {quizData.accessType === 'SELECTED_STUDENTS' && (
                            <div>
                                <h3 style={{
                                    margin: '0 0 15px 0',
                                    color: '#2c3e50',
                                    fontSize: '16px',
                                    fontWeight: '600'
                                }}>
                                    Select Students ({selectedStudents.length} selected)
                                </h3>
                                <div style={{
                                    maxHeight: '200px',
                                    overflowY: 'auto',
                                    border: '2px solid rgba(255, 193, 7, 0.2)',
                                    borderRadius: '8px',
                                    padding: '15px',
                                    background: 'rgba(255, 255, 255, 0.8)'
                                }}>
                                    {allStudents.map(student => (
                                        <label key={student.id} style={{
                                            display: 'block',
                                            marginBottom: '8px',
                                            cursor: 'pointer',
                                            fontSize: '14px'
                                        }}>
                                            <input
                                                type="checkbox"
                                                checked={selectedStudents.includes(student.id)}
                                                onChange={() => handleStudentSelection(student.id)}
                                                style={{ marginRight: '8px' }}
                                            />
                                            {student.username} ({student.email})
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Scheduling */}
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(156, 39, 176, 0.1) 0%, rgba(233, 30, 99, 0.1) 100%)',
                        borderRadius: '15px',
                        padding: '25px',
                        marginBottom: '30px',
                        border: '1px solid rgba(156, 39, 176, 0.2)'
                    }}>
                        <h2 style={{
                            margin: '0 0 20px 0',
                            color: '#2c3e50',
                            fontSize: '24px',
                            fontWeight: '700',
                            borderBottom: '3px solid #9c27b0',
                            paddingBottom: '10px'
                        }}>
                            📅 Scheduling & Access
                        </h2>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '8px',
                                    color: '#2c3e50',
                                    fontSize: '14px',
                                    fontWeight: '600'
                                }}>
                                    Start Date & Time
                                </label>
                                <input
                                    type="datetime-local"
                                    value={quizData.startDate}
                                    onChange={(e) => updateQuizData('startDate', e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        border: '2px solid rgba(156, 39, 176, 0.2)',
                                        borderRadius: '6px',
                                        fontSize: '14px',
                                        background: 'rgba(255, 255, 255, 0.8)'
                                    }}
                                />
                            </div>

                            <div>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '8px',
                                    color: '#2c3e50',
                                    fontSize: '14px',
                                    fontWeight: '600'
                                }}>
                                    End Date & Time
                                </label>
                                <input
                                    type="datetime-local"
                                    value={quizData.endDate}
                                    onChange={(e) => updateQuizData('endDate', e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        border: '2px solid rgba(156, 39, 176, 0.2)',
                                        borderRadius: '6px',
                                        fontSize: '14px',
                                        background: 'rgba(255, 255, 255, 0.8)'
                                    }}
                                />
                            </div>
                        </div>

                        <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '8px',
                                    color: '#2c3e50',
                                    fontSize: '14px',
                                    fontWeight: '600'
                                }}>
                                    Late Access Policy
                                </label>
                                <select
                                    value={quizData.lateAccessPolicy}
                                    onChange={(e) => updateQuizData('lateAccessPolicy', e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        border: '2px solid rgba(156, 39, 176, 0.2)',
                                        borderRadius: '6px',
                                        fontSize: '14px',
                                        background: 'rgba(255, 255, 255, 0.8)'
                                    }}
                                >
                                    <option value="ALLOW">Allow Late Access</option>
                                    <option value="DISALLOW">Disallow Late Access</option>
                                </select>
                            </div>

                            <div>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '8px',
                                    color: '#2c3e50',
                                    fontSize: '14px',
                                    fontWeight: '600'
                                }}>
                                    Visibility
                                </label>
                                <select
                                    value={quizData.visibility}
                                    onChange={(e) => updateQuizData('visibility', e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        border: '2px solid rgba(156, 39, 176, 0.2)',
                                        borderRadius: '6px',
                                        fontSize: '14px',
                                        background: 'rgba(255, 255, 255, 0.8)'
                                    }}
                                >
                                    <option value="DRAFT">Draft (Hidden)</option>
                                    <option value="PUBLISHED">Published (Visible)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Questions Section */}
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.9) 100%)',
                        borderRadius: '15px',
                        padding: '25px',
                        marginBottom: '30px',
                        border: '2px dashed rgba(102, 126, 234, 0.3)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{
                                margin: 0,
                                color: '#2c3e50',
                                fontSize: '24px',
                                fontWeight: '700'
                            }}>
                                ❓ Questions ({questions.length})
                            </h2>
                            <button
                                onClick={() => setShowQuestionForm(true)}
                                style={{
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    color: 'white',
                                    border: 'none',
                                    padding: '12px 20px',
                                    borderRadius: '25px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)'
                                }}
                            >
                                ➕ Add Question
                            </button>
                        </div>

                        {questions.length === 0 ? (
                            <div style={{
                                textAlign: 'center',
                                padding: '40px 20px',
                                color: '#666'
                            }}>
                                <div style={{ fontSize: '48px', marginBottom: '15px' }}>📝</div>
                                <p>No questions added yet. Click "Add Question" to get started.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gap: '15px' }}>
                                {questions.map((question, index) => (
                                    <div
                                        key={question.id}
                                        style={{
                                            background: 'rgba(102, 126, 234, 0.05)',
                                            borderRadius: '10px',
                                            padding: '20px',
                                            border: '1px solid rgba(102, 126, 234, 0.2)'
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <div style={{ flex: 1 }}>
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    marginBottom: '10px'
                                                }}>
                                                    <span style={{
                                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                        color: 'white',
                                                        padding: '4px 12px',
                                                        borderRadius: '15px',
                                                        fontSize: '12px',
                                                        fontWeight: '600',
                                                        marginRight: '10px'
                                                    }}>
                                                        Q{index + 1}
                                                    </span>
                                                    <span style={{
                                                        color: '#2c3e50',
                                                        fontSize: '14px',
                                                        fontWeight: '600'
                                                    }}>
                                                        {question.questionType} • {question.marks} marks
                                                    </span>
                                                </div>
                                                <p style={{
                                                    margin: '0 0 10px 0',
                                                    color: '#2c3e50',
                                                    fontSize: '16px',
                                                    fontWeight: '500'
                                                }}>
                                                    {question.questionText}
                                                </p>

                                                {question.questionType === 'MCQ' && (
                                                    <div style={{ marginTop: '10px' }}>
                                                        {question.options.map((option, optIndex) => (
                                                            <div
                                                                key={optIndex}
                                                                style={{
                                                                    padding: '8px 12px',
                                                                    margin: '4px 0',
                                                                    borderRadius: '6px',
                                                                    background: optIndex === question.correctOptionIndex
                                                                        ? 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
                                                                        : 'rgba(255, 255, 255, 0.8)',
                                                                    color: optIndex === question.correctOptionIndex ? 'white' : '#666',
                                                                    fontSize: '14px'
                                                                }}
                                                            >
                                                                {String.fromCharCode(65 + optIndex)}. {option}
                                                                {optIndex === question.correctOptionIndex && ' ✓'}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {question.questionType === 'TRUE_FALSE' && (
                                                    <div style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
                                                        Correct Answer: {question.correctAnswer}
                                                    </div>
                                                )}

                                                {question.questionType === 'SHORT_ANSWER' && (
                                                    <div style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
                                                        Expected Answer: {question.correctAnswer}
                                                    </div>
                                                )}
                                            </div>

                                            <div style={{ display: 'flex', gap: '10px', marginLeft: '20px' }}>
                                                <button
                                                    onClick={() => editQuestion(index)}
                                                    style={{
                                                        background: 'linear-gradient(135deg, #ffc107 0%, #ff8f00 100%)',
                                                        color: 'white',
                                                        border: 'none',
                                                        padding: '8px 12px',
                                                        borderRadius: '6px',
                                                        fontSize: '12px',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    ✏️ Edit
                                                </button>
                                                <button
                                                    onClick={() => deleteQuestion(index)}
                                                    style={{
                                                        background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
                                                        color: 'white',
                                                        border: 'none',
                                                        padding: '8px 12px',
                                                        borderRadius: '6px',
                                                        fontSize: '12px',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    🗑️ Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Question Form Modal */}
                    {showQuestionForm && (
                        <div style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'rgba(0, 0, 0, 0.5)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 1000
                        }}>
                            <div style={{
                                background: 'white',
                                borderRadius: '15px',
                                padding: '30px',
                                maxWidth: '600px',
                                width: '90%',
                                maxHeight: '80vh',
                                overflowY: 'auto'
                            }}>
                                <h3 style={{
                                    margin: '0 0 20px 0',
                                    color: '#2c3e50',
                                    fontSize: '24px',
                                    fontWeight: '700'
                                }}>
                                    {editingQuestionIndex >= 0 ? 'Edit Question' : 'Add New Question'}
                                </h3>

                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '8px',
                                        color: '#2c3e50',
                                        fontSize: '16px',
                                        fontWeight: '600'
                                    }}>
                                        Question Type
                                    </label>
                                    <select
                                        value={currentQuestion.questionType}
                                        onChange={(e) => setCurrentQuestion(prev => ({
                                            ...prev,
                                            questionType: e.target.value
                                        }))}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            border: '2px solid rgba(102, 126, 234, 0.2)',
                                            borderRadius: '8px',
                                            fontSize: '14px',
                                            background: 'rgba(255, 255, 255, 0.8)'
                                        }}
                                    >
                                        <option value="MCQ">Multiple Choice Question (MCQ)</option>
                                        <option value="TRUE_FALSE">True/False</option>
                                        <option value="SHORT_ANSWER">Short Answer</option>
                                    </select>
                                </div>

                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '8px',
                                        color: '#2c3e50',
                                        fontSize: '16px',
                                        fontWeight: '600'
                                    }}>
                                        Question Text
                                    </label>
                                    <textarea
                                        value={currentQuestion.questionText}
                                        onChange={(e) => setCurrentQuestion(prev => ({
                                            ...prev,
                                            questionText: e.target.value
                                        }))}
                                        placeholder="Enter your question here..."
                                        rows="4"
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            border: '2px solid rgba(102, 126, 234, 0.2)',
                                            borderRadius: '8px',
                                            fontSize: '14px',
                                            background: 'rgba(255, 255, 255, 0.8)',
                                            resize: 'vertical'
                                        }}
                                    />
                                </div>

                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '8px',
                                        color: '#2c3e50',
                                        fontSize: '16px',
                                        fontWeight: '600'
                                    }}>
                                        Marks
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={currentQuestion.marks}
                                        onChange={(e) => setCurrentQuestion(prev => ({
                                            ...prev,
                                            marks: parseInt(e.target.value) || 1
                                        }))}
                                        style={{
                                            width: '100px',
                                            padding: '10px',
                                            border: '2px solid rgba(102, 126, 234, 0.2)',
                                            borderRadius: '6px',
                                            fontSize: '14px',
                                            background: 'rgba(255, 255, 255, 0.8)'
                                        }}
                                    />
                                </div>

                                {currentQuestion.questionType === 'MCQ' && (
                                    <div style={{ marginBottom: '20px' }}>
                                        <label style={{
                                            display: 'block',
                                            marginBottom: '15px',
                                            color: '#2c3e50',
                                            fontSize: '16px',
                                            fontWeight: '600'
                                        }}>
                                            Options (Select the correct answer)
                                        </label>
                                        {currentQuestion.options.map((option, index) => (
                                            <div key={index} style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                marginBottom: '10px'
                                            }}>
                                                <input
                                                    type="radio"
                                                    name="correctAnswer"
                                                    checked={currentQuestion.correctOptionIndex === index}
                                                    onChange={() => setCurrentQuestion(prev => ({
                                                        ...prev,
                                                        correctOptionIndex: index
                                                    }))}
                                                    style={{ marginRight: '10px' }}
                                                />
                                                <input
                                                    type="text"
                                                    value={option}
                                                    onChange={(e) => {
                                                        const newOptions = [...currentQuestion.options];
                                                        newOptions[index] = e.target.value;
                                                        setCurrentQuestion(prev => ({
                                                            ...prev,
                                                            options: newOptions
                                                        }));
                                                    }}
                                                    placeholder={`Option ${String.fromCharCode(65 + index)}`}
                                                    style={{
                                                        flex: 1,
                                                        padding: '10px',
                                                        border: '2px solid rgba(102, 126, 234, 0.2)',
                                                        borderRadius: '6px',
                                                        fontSize: '14px',
                                                        background: 'rgba(255, 255, 255, 0.8)',
                                                        marginRight: '10px'
                                                    }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {currentQuestion.questionType === 'TRUE_FALSE' && (
                                    <div style={{ marginBottom: '20px' }}>
                                        <label style={{
                                            display: 'block',
                                            marginBottom: '8px',
                                            color: '#2c3e50',
                                            fontSize: '16px',
                                            fontWeight: '600'
                                        }}>
                                            Correct Answer
                                        </label>
                                        <select
                                            value={currentQuestion.correctAnswer}
                                            onChange={(e) => setCurrentQuestion(prev => ({
                                                ...prev,
                                                correctAnswer: e.target.value
                                            }))}
                                            style={{
                                                width: '100%',
                                                padding: '12px',
                                                border: '2px solid rgba(102, 126, 234, 0.2)',
                                                borderRadius: '8px',
                                                fontSize: '14px',
                                                background: 'rgba(255, 255, 255, 0.8)'
                                            }}
                                        >
                                            <option value="">Select Answer</option>
                                            <option value="True">True</option>
                                            <option value="False">False</option>
                                        </select>
                                    </div>
                                )}

                                {currentQuestion.questionType === 'SHORT_ANSWER' && (
                                    <div style={{ marginBottom: '20px' }}>
                                        <label style={{
                                            display: 'block',
                                            marginBottom: '8px',
                                            color: '#2c3e50',
                                            fontSize: '16px',
                                            fontWeight: '600'
                                        }}>
                                            Expected Answer
                                        </label>
                                        <input
                                            type="text"
                                            value={currentQuestion.correctAnswer}
                                            onChange={(e) => setCurrentQuestion(prev => ({
                                                ...prev,
                                                correctAnswer: e.target.value
                                            }))}
                                            placeholder="Enter the expected answer"
                                            style={{
                                                width: '100%',
                                                padding: '12px',
                                                border: '2px solid rgba(102, 126, 234, 0.2)',
                                                borderRadius: '8px',
                                                fontSize: '14px',
                                                background: 'rgba(255, 255, 255, 0.8)'
                                            }}
                                        />
                                    </div>
                                )}

                                <div style={{
                                    display: 'flex',
                                    gap: '15px',
                                    justifyContent: 'flex-end',
                                    marginTop: '30px'
                                }}>
                                    <button
                                        onClick={() => {
                                            setShowQuestionForm(false);
                                            setEditingQuestionIndex(-1);
                                            setCurrentQuestion({
                                                questionText: '',
                                                questionType: 'MCQ',
                                                marks: 1,
                                                options: ['', '', '', ''],
                                                correctAnswer: '',
                                                correctOptionIndex: -1
                                            });
                                        }}
                                        style={{
                                            background: 'rgba(108, 117, 125, 0.9)',
                                            color: 'white',
                                            border: 'none',
                                            padding: '12px 24px',
                                            borderRadius: '8px',
                                            fontSize: '14px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={addQuestion}
                                        style={{
                                            background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                                            color: 'white',
                                            border: 'none',
                                            padding: '12px 24px',
                                            borderRadius: '8px',
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {editingQuestionIndex >= 0 ? 'Update Question' : 'Add Question'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div style={{
                        display: 'flex',
                        gap: '15px',
                        justifyContent: 'center',
                        marginTop: '40px'
                    }}>
                        <button
                            onClick={handleSubmit}
                            disabled={isLoading}
                            style={{
                                flex: '1',
                                minWidth: '200px',
                                padding: '16px',
                                background: isLoading
                                    ? 'linear-gradient(135deg, #ccc 0%, #999 100%)'
                                    : 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '12px',
                                fontSize: '16px',
                                fontWeight: '700',
                                cursor: isLoading ? 'not-allowed' : 'pointer',
                                transition: 'all 0.3s ease',
                                boxShadow: isLoading
                                    ? '0 8px 25px rgba(0, 0, 0, 0.1)'
                                    : '0 12px 35px rgba(67, 233, 123, 0.3)',
                                textTransform: 'uppercase',
                                letterSpacing: '1px'
                            }}
                        >
                            {isLoading ? '⏳ Creating Quiz...' : '✅ Create Quiz'}
                        </button>

                        <button
                            onClick={() => navigate('/teacher')}
                            style={{
                                flex: '1',
                                minWidth: '200px',
                                padding: '16px',
                                background: 'rgba(108, 117, 125, 0.9)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '12px',
                                fontSize: '16px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            ← Back to Dashboard
                        </button>
                    </div>
                </div>

                {/* Preview Panel */}
                <div style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '20px',
                    padding: '30px',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    height: 'fit-content',
                    position: 'sticky',
                    top: '20px'
                }}>
                    <h3 style={{
                        margin: '0 0 20px 0',
                        color: '#2c3e50',
                        fontSize: '20px',
                        fontWeight: '700',
                        textAlign: 'center',
                        borderBottom: '2px solid #667eea',
                        paddingBottom: '10px'
                    }}>
                        📊 Quiz Preview
                    </h3>

                    <div style={{ display: 'grid', gap: '15px' }}>
                        <div style={{
                            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                            padding: '15px',
                            borderRadius: '10px',
                            border: '1px solid rgba(102, 126, 234, 0.2)'
                        }}>
                            <div style={{
                                fontSize: '14px',
                                color: '#666',
                                marginBottom: '5px',
                                fontWeight: '600'
                            }}>
                                Quiz Title
                            </div>
                            <div style={{
                                fontSize: '16px',
                                color: '#2c3e50',
                                fontWeight: '600'
                            }}>
                                {quizData.title || 'Untitled Quiz'}
                            </div>
                        </div>

                        <div style={{
                            background: 'linear-gradient(135deg, rgba(67, 233, 123, 0.1) 0%, rgba(56, 249, 215, 0.1) 100%)',
                            padding: '15px',
                            borderRadius: '10px',
                            border: '1px solid rgba(67, 233, 123, 0.2)'
                        }}>
                            <div style={{
                                fontSize: '14px',
                                color: '#666',
                                marginBottom: '5px',
                                fontWeight: '600'
                            }}>
                                Subject & Class
                            </div>
                            <div style={{
                                fontSize: '16px',
                                color: '#2c3e50',
                                fontWeight: '600'
                            }}>
                                {quizData.subject || 'No subject'} • {quizData.classSemester || 'No class'}
                            </div>
                        </div>

                        <div style={{
                            background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 87, 34, 0.1) 100%)',
                            padding: '15px',
                            borderRadius: '10px',
                            border: '1px solid rgba(255, 193, 7, 0.2)'
                        }}>
                            <div style={{
                                fontSize: '14px',
                                color: '#666',
                                marginBottom: '5px',
                                fontWeight: '600'
                            }}>
                                Total Questions
                            </div>
                            <div style={{
                                fontSize: '24px',
                                color: '#2c3e50',
                                fontWeight: '800'
                            }}>
                                {questions.length}
                            </div>
                        </div>

                        <div style={{
                            background: 'linear-gradient(135deg, rgba(156, 39, 176, 0.1) 0%, rgba(233, 30, 99, 0.1) 100%)',
                            padding: '15px',
                            borderRadius: '10px',
                            border: '1px solid rgba(156, 39, 176, 0.2)'
                        }}>
                            <div style={{
                                fontSize: '14px',
                                color: '#666',
                                marginBottom: '5px',
                                fontWeight: '600'
                            }}>
                                Total Marks
                            </div>
                            <div style={{
                                fontSize: '24px',
                                color: '#2c3e50',
                                fontWeight: '800'
                            }}>
                                {quizData.totalMarks || calculateTotalMarks()}
                            </div>
                        </div>

                        <div style={{
                            background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 87, 34, 0.1) 100%)',
                            padding: '15px',
                            borderRadius: '10px',
                            border: '1px solid rgba(255, 193, 7, 0.2)'
                        }}>
                            <div style={{
                                fontSize: '14px',
                                color: '#666',
                                marginBottom: '5px',
                                fontWeight: '600'
                            }}>
                                Time Limit
                            </div>
                            <div style={{
                                fontSize: '20px',
                                color: '#2c3e50',
                                fontWeight: '700'
                            }}>
                                {quizData.timeLimit} min
                            </div>
                        </div>

                        <div style={{
                            background: 'linear-gradient(135deg, rgba(67, 233, 123, 0.1) 0%, rgba(56, 249, 215, 0.1) 100%)',
                            padding: '15px',
                            borderRadius: '10px',
                            border: '1px solid rgba(67, 233, 123, 0.2)'
                        }}>
                            <div style={{
                                fontSize: '14px',
                                color: '#666',
                                marginBottom: '5px',
                                fontWeight: '600'
                            }}>
                                Students Targeted
                            </div>
                            <div style={{
                                fontSize: '18px',
                                color: '#2c3e50',
                                fontWeight: '600'
                            }}>
                                {quizData.accessType === 'ALL_CLASS'
                                    ? (quizData.classSemester ? `All ${quizData.classSemester}` : 'All Class')
                                    : `${selectedStudents.length} selected`
                                }
                            </div>
                        </div>

                        <div style={{
                            background: 'linear-gradient(135deg, rgba(156, 39, 176, 0.1) 0%, rgba(233, 30, 99, 0.1) 100%)',
                            padding: '15px',
                            borderRadius: '10px',
                            border: '1px solid rgba(156, 39, 176, 0.2)'
                        }}>
                            <div style={{
                                fontSize: '14px',
                                color: '#666',
                                marginBottom: '5px',
                                fontWeight: '600'
                            }}>
                                Status
                            </div>
                            <div style={{
                                display: 'inline-block',
                                background: quizData.visibility === 'PUBLISHED'
                                    ? 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
                                    : 'linear-gradient(135deg, #ffc107 0%, #ff8f00 100%)',
                                color: 'white',
                                padding: '6px 12px',
                                borderRadius: '15px',
                                fontSize: '12px',
                                fontWeight: '600',
                                textTransform: 'uppercase'
                            }}>
                                {quizData.visibility === 'PUBLISHED' ? 'Published' : 'Draft'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateQuiz;
