import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const GradeAssignment = () => {
    const { submissionId } = useParams();
    const navigate = useNavigate();
    const [submission, setSubmission] = useState(null);
    const [marks, setMarks] = useState('');
    const [feedback, setFeedback] = useState('');
    const [rubric, setRubric] = useState(null);
    const [rubricScores, setRubricScores] = useState([]);
    const [totalScore, setTotalScore] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchSubmissionDetails();
    }, [submissionId]);

    const fetchSubmissionDetails = async () => {
        try {
            const response = await axios.get(`http://localhost:8080/api/assignments/submissions/${submissionId}`);
            setSubmission(response.data);

            // Fetch rubric if assignment has one
            if (response.data.assignment && response.data.assignment.id) {
                try {
                    const rubricResponse = await axios.get(`http://localhost:8080/api/assignments/${response.data.assignment.id}/rubric`);
                    if (rubricResponse.data) {
                        setRubric(rubricResponse.data);
                        // Initialize rubric scores
                        const initialScores = rubricResponse.data.criteria.map(criteria => ({
                            criteriaId: criteria.id,
                            score: 0,
                            comments: ''
                        }));
                        setRubricScores(initialScores);
                    }
                } catch (rubricError) {
                    console.error('Error fetching rubric:', rubricError);
                    // Rubric not found, continue without it
                }
            }

            // Pre-fill if already graded
            if (response.data.grade !== null && response.data.grade !== undefined) {
                setMarks(response.data.grade.toString());
                setFeedback(response.data.feedback || '');
            }
        } catch (error) {
            console.error('Error fetching submission:', error);
            setError('Failed to load submission details');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveDraft = async () => {
        setIsSubmitting(true);
        setError('');
        setSuccess('');

        try {
            const requestData = {
                submission_id: parseInt(submissionId),
                feedback: feedback.trim(),
                action: 'draft' // Indicate this is a draft save
            };

            if (rubric && rubricScores.length > 0) {
                // Send rubric scores
                requestData.rubricScores = rubricScores.map(score => ({
                    criteriaId: score.criteriaId,
                    score: score.score || 0,
                    comments: score.comments || ''
                }));
            } else {
                // Fallback to simple marks
                const marksValue = parseFloat(marks);
                if (isNaN(marksValue) || marksValue < 0) {
                    setError('Please enter valid marks');
                    setIsSubmitting(false);
                    return;
                }
                requestData.marks = marksValue;
            }

            console.log('Saving draft:', requestData);

            const response = await axios.post('http://localhost:8080/api/teacher/grades', requestData);
            console.log('Draft save response:', response.data);

            setSuccess('Grade saved as draft successfully!');
            // Update local state to reflect grading
            setSubmission(prev => ({
                ...prev,
                grade: rubric ? totalScore : parseFloat(marks),
                feedback: feedback.trim()
            }));

            // Redirect back to submissions list after a delay
            setTimeout(() => {
                navigate('/teacher/view-submissions');
            }, 2000);

        } catch (error) {
            console.error('Error saving draft:', error);
            setError('Failed to save draft. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setIsSubmitting(true);
        setError('');
        setSuccess('');

        try {
            const requestData = {
                submission_id: parseInt(submissionId),
                feedback: feedback.trim(),
                action: 'publish' // Indicate this is final submission
            };

            if (rubric && rubricScores.length > 0) {
                // Send rubric scores
                requestData.rubricScores = rubricScores.map(score => ({
                    criteriaId: score.criteriaId,
                    score: score.score || 0,
                    comments: score.comments || ''
                }));
            } else {
                // Fallback to simple marks
                const marksValue = parseFloat(marks);
                if (isNaN(marksValue) || marksValue < 0) {
                    setError('Please enter valid marks');
                    setIsSubmitting(false);
                    return;
                }
                requestData.marks = marksValue;
            }

            console.log('Publishing final grade:', requestData);

            const response = await axios.post('http://localhost:8080/api/teacher/grades', requestData);
            console.log('Final grade response:', response.data);

            setSuccess('Grade submitted successfully!');
            // Update local state to reflect grading
            setSubmission(prev => ({
                ...prev,
                grade: rubric ? totalScore : parseFloat(marks),
                feedback: feedback.trim()
            }));

            // Redirect back to submissions list after a delay
            setTimeout(() => {
                navigate('/teacher/view-submissions');
            }, 2000);

        } catch (error) {
            console.error('Error submitting grade:', error);
            setError('Failed to submit grade. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRejectSubmission = async () => {
        const reason = feedback.trim() || 'Submission rejected by teacher';

        if (!window.confirm('Are you sure you want to reject this submission? This action cannot be undone.')) {
            return;
        }

        setIsSubmitting(true);
        setError('');
        setSuccess('');

        try {
            // First, check if a grade already exists for this submission
            let gradeId = null;
            try {
                const gradesResponse = await axios.get(`http://localhost:8080/api/grades/submission/${submissionId}`);
                if (gradesResponse.data && gradesResponse.data.id) {
                    gradeId = gradesResponse.data.id;
                }
            } catch (gradeError) {
                // No existing grade, that's fine
            }

            if (gradeId) {
                // Reject existing grade
                await axios.post(`http://localhost:8080/api/teacher/grades/${gradeId}/reject`, {
                    reason: reason
                });
            } else {
                // Create a new grade and then reject it
                const createGradeResponse = await axios.post('http://localhost:8080/api/teacher/grades', {
                    submission_id: parseInt(submissionId),
                    feedback: reason,
                    marks: 0 // Rejected submissions get 0 marks
                });

                // Then reject it
                const newGradeId = createGradeResponse.data.id; // Assuming the response includes the grade ID
                await axios.post(`http://localhost:8080/api/teacher/grades/${newGradeId}/reject`, {
                    reason: reason
                });
            }

            setSuccess('Submission rejected successfully!');
            // Update local state to reflect rejection
            setSubmission(prev => ({
                ...prev,
                grade: 0,
                feedback: reason
            }));

            // Redirect back to submissions list after a delay
            setTimeout(() => {
                navigate('/teacher/view-submissions');
            }, 2000);

        } catch (error) {
            console.error('Error rejecting submission:', error);
            setError('Failed to reject submission. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFileClick = (filename) => {
        const fileUrl = `http://localhost:8080/uploads/submissions/${filename}`;
        window.open(fileUrl, '_blank');
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString();
    };

    if (isLoading) {
        return (
            <div style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
            }}>
                <div style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    padding: '40px',
                    borderRadius: '20px',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
                    textAlign: 'center'
                }}>
                    <div style={{
                        fontSize: '48px',
                        marginBottom: '20px'
                    }}>⏳</div>
                    <div style={{
                        fontSize: '18px',
                        color: '#666',
                        fontWeight: '500'
                    }}>Loading submission details...</div>
                </div>
            </div>
        );
    }

    if (error && !submission) {
        return (
            <div style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
            }}>
                <div style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    padding: '40px',
                    borderRadius: '20px',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
                    textAlign: 'center',
                    maxWidth: '500px'
                }}>
                    <div style={{
                        fontSize: '48px',
                        marginBottom: '20px',
                        color: '#e74c3c'
                    }}>❌</div>
                    <div style={{
                        fontSize: '18px',
                        color: '#666',
                        fontWeight: '500',
                        marginBottom: '20px'
                    }}>{error}</div>
                    <button
                        onClick={() => navigate('/teacher/view-submissions')}
                        style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            border: 'none',
                            padding: '12px 24px',
                            borderRadius: '25px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '16px'
                        }}
                    >
                        ← Back to Submissions
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '40px',
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        }}>
            <div style={{
                maxWidth: '1000px',
                margin: '0 auto',
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
                        📊 Grade Assignment
                    </h1>
                    <p style={{
                        margin: 0,
                        color: '#666',
                        fontSize: '16px',
                        fontWeight: '500'
                    }}>
                        Evaluate student submission and provide feedback
                    </p>
                </div>

                {/* Grade Status */}
                <div style={{
                    background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 87, 34, 0.1) 100%)',
                    borderRadius: '15px',
                    padding: '20px',
                    marginBottom: '30px',
                    border: '2px solid rgba(255, 193, 7, 0.3)',
                    textAlign: 'center'
                }}>
                    <h2 style={{
                        margin: '0 0 10px 0',
                        color: '#2c3e50',
                        fontSize: '20px',
                        fontWeight: '700'
                    }}>
                        📈 Grade Status
                    </h2>
                    <div style={{
                        fontSize: '18px',
                        fontWeight: '600',
                        color: submission?.grade !== null && submission?.grade !== undefined
                            ? (submission.grade >= (submission.assignment?.totalMarks || 100) * 0.6 ? '#27ae60' : '#e67e22')
                            : '#95a5a6'
                    }}>
                        {submission?.grade !== null && submission?.grade !== undefined
                            ? `Graded: ${submission.grade}/${submission.assignment?.totalMarks || 'N/A'} marks`
                            : 'Not Graded Yet'
                        }
                    </div>
                </div>

                {/* Submission Details */}
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
                        📋 Submission Details
                    </h2>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div>
                            <strong style={{ color: '#2c3e50', fontSize: '16px' }}>Student Name:</strong>
                            <div style={{ marginTop: '5px', color: '#666', fontSize: '16px' }}>
                                👤 {submission?.submittedBy?.username || 'Unknown'}
                            </div>
                        </div>

                        <div>
                            <strong style={{ color: '#2c3e50', fontSize: '16px' }}>Assignment:</strong>
                            <div style={{ marginTop: '5px', color: '#666', fontSize: '16px' }}>
                                📝 {submission?.assignment?.title || 'Unknown'}
                            </div>
                        </div>

                        <div>
                            <strong style={{ color: '#2c3e50', fontSize: '16px' }}>Submission Date:</strong>
                            <div style={{ marginTop: '5px', color: '#666', fontSize: '16px' }}>
                                📅 {formatDate(submission?.submitDate)}
                            </div>
                        </div>

                        <div>
                            <strong style={{ color: '#2c3e50', fontSize: '16px' }}>Total Marks:</strong>
                            <div style={{ marginTop: '5px', color: '#666', fontSize: '16px' }}>
                                🎯 {submission?.assignment?.totalMarks || 'N/A'}
                            </div>
                        </div>
                    </div>

                    {/* Submission File */}
                    <div style={{ marginTop: '20px' }}>
                        <strong style={{ color: '#2c3e50', fontSize: '16px' }}>Submitted File:</strong>
                        <div style={{ marginTop: '10px' }}>
                            {submission?.fileName ? (
                                <button
                                    onClick={() => handleFileClick(submission.fileName)}
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        color: 'white',
                                        border: 'none',
                                        padding: '12px 20px',
                                        borderRadius: '25px',
                                        fontWeight: '600',
                                        fontSize: '14px',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)'
                                    }}
                                    onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                                    onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                                >
                                    ⬇️ Download File: {submission.fileName}
                                </button>
                            ) : (
                                <span style={{
                                    color: '#e74c3c',
                                    fontStyle: 'italic',
                                    fontSize: '16px'
                                }}>
                                    📭 No file submitted
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Grading Form */}
                <div style={{
                    background: 'linear-gradient(135deg, rgba(67, 233, 123, 0.1) 0%, rgba(56, 249, 215, 0.1) 100%)',
                    borderRadius: '15px',
                    padding: '25px',
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
                        ✏️ {rubric ? 'Rubric-Based Grading' : 'Simple Grading'}
                    </h2>

                    {!rubric && (
                        <div style={{ marginBottom: '30px' }}>
                            <div style={{
                                background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 87, 34, 0.1) 100%)',
                                borderRadius: '15px',
                                padding: '20px',
                                border: '2px solid rgba(255, 193, 7, 0.3)',
                                marginBottom: '20px',
                                textAlign: 'center'
                            }}>
                                <div style={{
                                    fontSize: '48px',
                                    marginBottom: '15px',
                                    opacity: 0.7
                                }}>
                                    📝
                                </div>
                                <h3 style={{
                                    margin: '0 0 10px 0',
                                    color: '#e67e22',
                                    fontSize: '18px',
                                    fontWeight: '700'
                                }}>
                                    Simple Grading Mode
                                </h3>
                                <p style={{
                                    margin: 0,
                                    color: '#666',
                                    fontSize: '14px',
                                    lineHeight: '1.5'
                                }}>
                                    Enter an overall grade for this submission. For detailed grading with multiple criteria like Logic, Code Quality, Output, etc., create a rubric first and attach it to the assignment.
                                </p>
                            </div>

                            {/* Simple Grading - Split Marks Input */}
                            <div style={{
                                background: 'linear-gradient(135deg, rgba(52, 152, 219, 0.1) 0%, rgba(41, 128, 185, 0.1) 100%)',
                                borderRadius: '12px',
                                padding: '20px',
                                border: '2px solid rgba(52, 152, 219, 0.2)',
                                marginBottom: '20px'
                            }}>
                                <h4 style={{
                                    margin: '0 0 15px 0',
                                    color: '#2c3e50',
                                    fontSize: '16px',
                                    fontWeight: '700',
                                    textAlign: 'center'
                                }}>
                                    📝 Enter Split-Up Marks (Optional)
                                </h4>
                                <p style={{
                                    margin: '0 0 20px 0',
                                    color: '#666',
                                    fontSize: '14px',
                                    textAlign: 'center',
                                    lineHeight: '1.5'
                                }}>
                                    Break down the total marks across different criteria for detailed evaluation. Leave blank to enter only overall marks.
                                </p>

                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                                    gap: '20px'
                                }}>
                                    {/* Logic Marks */}
                                    <div style={{
                                        background: 'rgba(255, 255, 255, 0.9)',
                                        padding: '20px',
                                        borderRadius: '12px',
                                        border: '2px solid rgba(102, 126, 234, 0.2)',
                                        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.1)'
                                    }}>
                                        <label style={{
                                            display: 'block',
                                            marginBottom: '12px',
                                            color: '#2c3e50',
                                            fontSize: '16px',
                                            fontWeight: '700',
                                            textAlign: 'center'
                                        }}>
                                            🧠 Logic & Algorithm
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            max={submission?.assignment?.totalMarks || 100}
                                            step="0.5"
                                            placeholder="0"
                                            style={{
                                                width: '100%',
                                                padding: '15px',
                                                border: '2px solid rgba(102, 126, 234, 0.2)',
                                                borderRadius: '8px',
                                                fontSize: '18px',
                                                fontWeight: '600',
                                                background: 'rgba(255, 255, 255, 0.9)',
                                                outline: 'none',
                                                textAlign: 'center',
                                                transition: 'border-color 0.3s ease'
                                            }}
                                            onFocus={(e) => e.target.style.borderColor = '#667eea'}
                                            onBlur={(e) => e.target.style.borderColor = 'rgba(102, 126, 234, 0.2)'}
                                        />
                                        <div style={{
                                            marginTop: '8px',
                                            color: '#666',
                                            fontSize: '12px',
                                            textAlign: 'center'
                                        }}>
                                            Correctness & efficiency of solution
                                        </div>
                                    </div>

                                    {/* Code Quality Marks */}
                                    <div style={{
                                        background: 'rgba(255, 255, 255, 0.9)',
                                        padding: '20px',
                                        borderRadius: '12px',
                                        border: '2px solid rgba(67, 233, 123, 0.2)',
                                        boxShadow: '0 4px 15px rgba(67, 233, 123, 0.1)'
                                    }}>
                                        <label style={{
                                            display: 'block',
                                            marginBottom: '12px',
                                            color: '#2c3e50',
                                            fontSize: '16px',
                                            fontWeight: '700',
                                            textAlign: 'center'
                                        }}>
                                            � Code Quality
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            max={submission?.assignment?.totalMarks || 100}
                                            step="0.5"
                                            placeholder="0"
                                            style={{
                                                width: '100%',
                                                padding: '15px',
                                                border: '2px solid rgba(67, 233, 123, 0.2)',
                                                borderRadius: '8px',
                                                fontSize: '18px',
                                                fontWeight: '600',
                                                background: 'rgba(255, 255, 255, 0.9)',
                                                outline: 'none',
                                                textAlign: 'center',
                                                transition: 'border-color 0.3s ease'
                                            }}
                                            onFocus={(e) => e.target.style.borderColor = '#43e97b'}
                                            onBlur={(e) => e.target.style.borderColor = 'rgba(67, 233, 123, 0.2)'}
                                        />
                                        <div style={{
                                            marginTop: '8px',
                                            color: '#666',
                                            fontSize: '12px',
                                            textAlign: 'center'
                                        }}>
                                            Readability, structure & best practices
                                        </div>
                                    </div>

                                    {/* Output Marks */}
                                    <div style={{
                                        background: 'rgba(255, 255, 255, 0.9)',
                                        padding: '20px',
                                        borderRadius: '12px',
                                        border: '2px solid rgba(255, 193, 7, 0.2)',
                                        boxShadow: '0 4px 15px rgba(255, 193, 7, 0.1)'
                                    }}>
                                        <label style={{
                                            display: 'block',
                                            marginBottom: '12px',
                                            color: '#2c3e50',
                                            fontSize: '16px',
                                            fontWeight: '700',
                                            textAlign: 'center'
                                        }}>
                                            📊 Output & Results
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            max={submission?.assignment?.totalMarks || 100}
                                            step="0.5"
                                            placeholder="0"
                                            style={{
                                                width: '100%',
                                                padding: '15px',
                                                border: '2px solid rgba(255, 193, 7, 0.2)',
                                                borderRadius: '8px',
                                                fontSize: '18px',
                                                fontWeight: '600',
                                                background: 'rgba(255, 255, 255, 0.9)',
                                                outline: 'none',
                                                textAlign: 'center',
                                                transition: 'border-color 0.3s ease'
                                            }}
                                            onFocus={(e) => e.target.style.borderColor = '#ffc107'}
                                            onBlur={(e) => e.target.style.borderColor = 'rgba(255, 193, 7, 0.2)'}
                                        />
                                        <div style={{
                                            marginTop: '8px',
                                            color: '#666',
                                            fontSize: '12px',
                                            textAlign: 'center'
                                        }}>
                                            Correctness & presentation of results
                                        </div>
                                    </div>
                                </div>

                                <div style={{
                                    marginTop: '20px',
                                    padding: '15px',
                                    background: 'linear-gradient(135deg, rgba(67, 233, 123, 0.1) 0%, rgba(56, 249, 215, 0.1) 100%)',
                                    borderRadius: '10px',
                                    border: '1px solid rgba(67, 233, 123, 0.2)',
                                    textAlign: 'center'
                                }}>
                                    <p style={{
                                        margin: 0,
                                        color: '#2c3e50',
                                        fontSize: '14px',
                                        fontWeight: '600'
                                    }}>
                                        💡 <strong>Tip:</strong> For more detailed grading with custom criteria, create a rubric in the teacher dashboard and attach it to the assignment.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Rubric Display */}
                    {rubric && (
                        <div style={{ marginBottom: '30px' }}>
                            <div style={{
                                background: 'rgba(255, 255, 255, 0.9)',
                                borderRadius: '12px',
                                padding: '20px',
                                marginBottom: '20px',
                                border: '1px solid rgba(102, 126, 234, 0.2)'
                            }}>
                                <h3 style={{
                                    margin: '0 0 15px 0',
                                    color: '#2c3e50',
                                    fontSize: '20px',
                                    fontWeight: '600'
                                }}>
                                    📋 {rubric.title}
                                </h3>
                                {rubric.description && (
                                    <p style={{
                                        margin: '0 0 15px 0',
                                        color: '#666',
                                        fontSize: '14px',
                                        lineHeight: '1.5'
                                    }}>
                                        {rubric.description}
                                    </p>
                                )}
                            </div>

                            {/* Rubric Criteria - Split Layout for Individual Mark Entry */}
                            <div style={{ marginBottom: '20px' }}>
                                <h3 style={{
                                    margin: '0 0 20px 0',
                                    color: '#2c3e50',
                                    fontSize: '20px',
                                    fontWeight: '700',
                                    textAlign: 'center',
                                    padding: '15px',
                                    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                                    borderRadius: '10px',
                                    border: '2px solid rgba(102, 126, 234, 0.2)'
                                }}>
                                    📝 Enter Marks for Each Criterion Individually
                                </h3>

                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                                    gap: '20px'
                                }}>
                                    {rubric.criteria && rubric.criteria.map((criteria, index) => (
                                        <div key={criteria.id} style={{
                                            background: 'rgba(255, 255, 255, 0.95)',
                                            borderRadius: '15px',
                                            padding: '25px',
                                            border: '2px solid rgba(102, 126, 234, 0.2)',
                                            boxShadow: '0 6px 20px rgba(102, 126, 234, 0.15)',
                                            position: 'relative',
                                            overflow: 'hidden'
                                        }}>
                                            {/* Header with Criterion Name and Max Points */}
                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                marginBottom: '20px',
                                                paddingBottom: '15px',
                                                borderBottom: '2px solid rgba(102, 126, 234, 0.1)'
                                            }}>
                                                <div style={{
                                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                    color: 'white',
                                                    padding: '10px 20px',
                                                    borderRadius: '25px',
                                                    fontSize: '18px',
                                                    fontWeight: '700',
                                                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
                                                }}>
                                                    📊 {criteria.criteriaName}
                                                </div>
                                                <div style={{
                                                    background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                                                    color: 'white',
                                                    padding: '12px 24px',
                                                    borderRadius: '30px',
                                                    fontSize: '16px',
                                                    fontWeight: '700',
                                                    boxShadow: '0 4px 15px rgba(67, 233, 123, 0.3)'
                                                }}>
                                                    🎯 Max: {criteria.maxPoints} pts
                                                </div>
                                            </div>

                                            {/* Description */}
                                            {criteria.description && (
                                                <div style={{
                                                    marginBottom: '20px',
                                                    padding: '15px',
                                                    background: 'rgba(102, 126, 234, 0.05)',
                                                    borderRadius: '10px',
                                                    border: '1px solid rgba(102, 126, 234, 0.1)'
                                                }}>
                                                    <p style={{
                                                        margin: 0,
                                                        color: '#666',
                                                        fontSize: '14px',
                                                        lineHeight: '1.5',
                                                        fontStyle: 'italic'
                                                    }}>
                                                        📋 {criteria.description}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Marks Input Section */}
                                            <div style={{ marginBottom: '20px' }}>
                                                <label style={{
                                                    display: 'block',
                                                    marginBottom: '12px',
                                                    color: '#2c3e50',
                                                    fontSize: '18px',
                                                    fontWeight: '700'
                                                }}>
                                                    🎯 Marks Awarded (0 - {criteria.maxPoints})
                                                </label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max={criteria.maxPoints}
                                                    step="0.5"
                                                    value={rubricScores[index]?.score || 0}
                                                    onChange={(e) => {
                                                        const value = parseFloat(e.target.value) || 0;
                                                        const updatedScores = [...rubricScores];
                                                        updatedScores[index] = {
                                                            ...updatedScores[index],
                                                            criteriaId: criteria.id,
                                                            score: value
                                                        };
                                                        setRubricScores(updatedScores);

                                                        // Calculate total score
                                                        const total = updatedScores.reduce((sum, score) => sum + (score.score || 0), 0);
                                                        setTotalScore(total);
                                                    }}
                                                    style={{
                                                        width: '100%',
                                                        padding: '20px',
                                                        border: '3px solid rgba(102, 126, 234, 0.3)',
                                                        borderRadius: '12px',
                                                        fontSize: '24px',
                                                        fontWeight: '800',
                                                        background: 'rgba(255, 255, 255, 0.95)',
                                                        outline: 'none',
                                                        transition: 'all 0.3s ease',
                                                        textAlign: 'center',
                                                        color: rubricScores[index]?.score >= criteria.maxPoints * 0.8 ? '#43e97b' :
                                                               rubricScores[index]?.score >= criteria.maxPoints * 0.6 ? '#f39c12' : '#e74c3c'
                                                    }}
                                                    onFocus={(e) => e.target.style.borderColor = '#667eea'}
                                                    onBlur={(e) => e.target.style.borderColor = 'rgba(102, 126, 234, 0.3)'}
                                                />
                                                <div style={{
                                                    marginTop: '10px',
                                                    color: '#666',
                                                    fontSize: '14px',
                                                    textAlign: 'center',
                                                    fontWeight: '500'
                                                }}>
                                                    Enter marks obtained for {criteria.criteriaName}
                                                </div>

                                                {/* Current Score Indicator */}
                                                <div style={{
                                                    marginTop: '15px',
                                                    padding: '10px',
                                                    background: 'rgba(67, 233, 123, 0.1)',
                                                    borderRadius: '8px',
                                                    border: '1px solid rgba(67, 233, 123, 0.2)',
                                                    textAlign: 'center'
                                                }}>
                                                    <div style={{
                                                        fontSize: '16px',
                                                        fontWeight: '600',
                                                        color: '#2c3e50'
                                                    }}>
                                                        Current: <span style={{
                                                            color: rubricScores[index]?.score >= criteria.maxPoints * 0.8 ? '#43e97b' :
                                                                   rubricScores[index]?.score >= criteria.maxPoints * 0.6 ? '#f39c12' : '#e74c3c',
                                                            fontWeight: '800'
                                                        }}>
                                                            {rubricScores[index]?.score || 0}
                                                        </span> / {criteria.maxPoints} points
                                                        <span style={{
                                                            marginLeft: '10px',
                                                            fontSize: '14px',
                                                            color: '#666'
                                                        }}>
                                                            ({criteria.maxPoints > 0 ? Math.round(((rubricScores[index]?.score || 0) / criteria.maxPoints) * 100) : 0}%)
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Feedback Section */}
                                            <div>
                                                <label style={{
                                                    display: 'block',
                                                    marginBottom: '12px',
                                                    color: '#2c3e50',
                                                    fontSize: '18px',
                                                    fontWeight: '700'
                                                }}>
                                                    💬 Specific Feedback for {criteria.criteriaName}
                                                </label>
                                                <textarea
                                                    value={rubricScores[index]?.comments || ''}
                                                    onChange={(e) => {
                                                        const updatedScores = [...rubricScores];
                                                        updatedScores[index] = {
                                                            ...updatedScores[index],
                                                            criteriaId: criteria.id,
                                                            comments: e.target.value
                                                        };
                                                        setRubricScores(updatedScores);
                                                    }}
                                                    placeholder={`Provide constructive feedback for ${criteria.criteriaName}...`}
                                                    rows="4"
                                                    style={{
                                                        width: '100%',
                                                        padding: '15px',
                                                        border: '2px solid rgba(102, 126, 234, 0.2)',
                                                        borderRadius: '10px',
                                                        fontSize: '14px',
                                                        background: 'rgba(255, 255, 255, 0.9)',
                                                        resize: 'vertical',
                                                        outline: 'none',
                                                        transition: 'border-color 0.3s ease'
                                                    }}
                                                    onFocus={(e) => e.target.style.borderColor = '#667eea'}
                                                    onBlur={(e) => e.target.style.borderColor = 'rgba(102, 126, 234, 0.2)'}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Total Score Display */}
                            <div style={{
                                background: 'linear-gradient(135deg, rgba(67, 233, 123, 0.2) 0%, rgba(56, 249, 215, 0.2) 100%)',
                                borderRadius: '12px',
                                padding: '20px',
                                border: '2px solid rgba(67, 233, 123, 0.3)',
                                marginBottom: '20px'
                            }}>
                                <div style={{ textAlign: 'center' }}>
                                    <h3 style={{
                                        margin: '0 0 15px 0',
                                        color: '#2c3e50',
                                        fontSize: '20px',
                                        fontWeight: '600'
                                    }}>
                                        📊 Grading Summary
                                    </h3>

                                    <div style={{ marginBottom: '15px' }}>
                                        <div style={{
                                            fontSize: '36px',
                                            fontWeight: '800',
                                            color: totalScore >= (rubric.criteria ? rubric.criteria.reduce((sum, c) => sum + (c.maxPoints || 0), 0) : 0) * 0.6 ? '#43e97b' : '#e67e22',
                                            marginBottom: '5px'
                                        }}>
                                            {totalScore.toFixed(1)} / {rubric.criteria ? rubric.criteria.reduce((sum, c) => sum + (c.maxPoints || 0), 0) : 0}
                                        </div>
                                        <div style={{
                                            color: '#666',
                                            fontSize: '14px',
                                            fontWeight: '500'
                                        }}>
                                            Total Marks Obtained
                                        </div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '15px' }}>
                                        <div>
                                            <div style={{
                                                fontSize: '24px',
                                                fontWeight: '700',
                                                color: '#43e97b'
                                            }}>
                                                {rubric.criteria ? Math.round((totalScore / rubric.criteria.reduce((sum, c) => sum + (c.maxPoints || 0), 0)) * 100) : 0}%
                                            </div>
                                            <div style={{
                                                color: '#666',
                                                fontSize: '12px',
                                                fontWeight: '500',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px'
                                            }}>
                                                Percentage
                                            </div>
                                        </div>
                                        <div>
                                            <div style={{
                                                fontSize: '24px',
                                                fontWeight: '700',
                                                color: totalScore >= (rubric.criteria ? rubric.criteria.reduce((sum, c) => sum + (c.maxPoints || 0), 0) : 0) * 0.6 ? '#43e97b' : '#e74c3c'
                                            }}>
                                                {totalScore >= (rubric.criteria ? rubric.criteria.reduce((sum, c) => sum + (c.maxPoints || 0), 0) : 0) * 0.6 ? 'PASS' : 'FAIL'}
                                            </div>
                                            <div style={{
                                                color: '#666',
                                                fontSize: '12px',
                                                fontWeight: '500',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px'
                                            }}>
                                                Status
                                            </div>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div style={{
                                        width: '100%',
                                        height: '12px',
                                        background: 'rgba(67, 233, 123, 0.2)',
                                        borderRadius: '6px',
                                        overflow: 'hidden',
                                        marginBottom: '10px'
                                    }}>
                                        <div style={{
                                            width: `${rubric.criteria ? Math.min((totalScore / rubric.criteria.reduce((sum, c) => sum + (c.maxPoints || 0), 0)) * 100, 100) : 0}%`,
                                            height: '100%',
                                            background: totalScore >= (rubric.criteria ? rubric.criteria.reduce((sum, c) => sum + (c.maxPoints || 0), 0) : 0) * 0.6
                                                ? 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
                                                : 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
                                            borderRadius: '6px',
                                            transition: 'width 0.3s ease'
                                        }} />
                                    </div>

                                    <div style={{
                                        color: '#666',
                                        fontSize: '12px',
                                        fontStyle: 'italic'
                                    }}>
                                        Auto-calculated from rubric criteria • Pass threshold: 60%
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {(error || success) && (
                        <div style={{
                            background: error
                                ? 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)'
                                : 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                            color: error ? '#721c24' : '#155724',
                            padding: '15px',
                            borderRadius: '12px',
                            marginBottom: '25px',
                            border: `1px solid ${error ? 'rgba(255, 107, 129, 0.3)' : 'rgba(40, 167, 69, 0.3)'}`,
                            fontSize: '14px',
                            fontWeight: '500',
                            textAlign: 'center'
                        }}>
                            {error || success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '8px',
                                color: '#2c3e50',
                                fontSize: '18px',
                                fontWeight: '600'
                            }}>
                                Marks Awarded * {rubric ? '(Auto-calculated from rubric)' : ''}
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                max={submission?.assignment?.totalMarks || 100}
                                value={rubric ? totalScore : marks}
                                onChange={(e) => setMarks(e.target.value)}
                                required
                                readOnly={rubric ? true : false}
                                style={{
                                    width: '100%',
                                    padding: '15px',
                                    border: '2px solid rgba(102, 126, 234, 0.2)',
                                    borderRadius: '12px',
                                    fontSize: '16px',
                                    background: rubric ? 'rgba(240, 240, 240, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                                    transition: 'all 0.3s ease',
                                    outline: 'none',
                                    boxSizing: 'border-box',
                                    cursor: rubric ? 'not-allowed' : 'text'
                                }}
                                placeholder={rubric ? 'Calculated from rubric scores above' : `Enter marks (max: ${submission?.assignment?.totalMarks || 'N/A'})`}
                            />
                            {rubric && (
                                <div style={{
                                    marginTop: '8px',
                                    color: '#666',
                                    fontSize: '14px',
                                    fontStyle: 'italic'
                                }}>
                                    💡 Enter marks for each criterion above - total will be calculated automatically
                                </div>
                            )}
                        </div>

                        <div style={{ marginBottom: '30px' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '8px',
                                color: '#2c3e50',
                                fontSize: '18px',
                                fontWeight: '600'
                            }}>
                                Feedback / Comments
                            </label>
                            <textarea
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                rows="6"
                                style={{
                                    width: '100%',
                                    padding: '15px',
                                    border: '2px solid rgba(102, 126, 234, 0.2)',
                                    borderRadius: '12px',
                                    fontSize: '16px',
                                    background: 'rgba(255, 255, 255, 0.8)',
                                    resize: 'vertical',
                                    transition: 'all 0.3s ease',
                                    outline: 'none',
                                    boxSizing: 'border-box'
                                }}
                                placeholder="Provide constructive feedback, suggestions for improvement, or praise good work. Add rubrics here if applicable."
                            />
                        </div>

                        <div style={{
                            display: 'flex',
                            gap: '15px',
                            justifyContent: 'center',
                            flexWrap: 'wrap'
                        }}>
                            <button
                                type="button"
                                onClick={handleSaveDraft}
                                disabled={isSubmitting}
                                style={{
                                    flex: '1',
                                    minWidth: '180px',
                                    padding: '16px',
                                    background: isSubmitting
                                        ? 'linear-gradient(135deg, #ccc 0%, #999 100%)'
                                        : 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '12px',
                                    fontSize: '14px',
                                    fontWeight: '700',
                                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.3s ease',
                                    boxShadow: isSubmitting
                                        ? '0 8px 25px rgba(0, 0, 0, 0.1)'
                                        : '0 12px 35px rgba(243, 156, 18, 0.3)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px'
                                }}
                            >
                                {isSubmitting ? '⏳ Saving...' : '📝 Save as Draft'}
                            </button>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                style={{
                                    flex: '1',
                                    minWidth: '180px',
                                    padding: '16px',
                                    background: isSubmitting
                                        ? 'linear-gradient(135deg, #ccc 0%, #999 100%)'
                                        : 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '12px',
                                    fontSize: '14px',
                                    fontWeight: '700',
                                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.3s ease',
                                    boxShadow: isSubmitting
                                        ? '0 8px 25px rgba(0, 0, 0, 0.1)'
                                        : '0 12px 35px rgba(67, 233, 123, 0.3)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px'
                                }}
                            >
                                {isSubmitting ? '⏳ Submitting...' : '✅ Submit Final Grade'}
                            </button>

                            <button
                                type="button"
                                onClick={handleRejectSubmission}
                                disabled={isSubmitting}
                                style={{
                                    flex: '1',
                                    minWidth: '180px',
                                    padding: '16px',
                                    background: isSubmitting
                                        ? 'linear-gradient(135deg, #ccc 0%, #999 100%)'
                                        : 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '12px',
                                    fontSize: '14px',
                                    fontWeight: '700',
                                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.3s ease',
                                    boxShadow: isSubmitting
                                        ? '0 8px 25px rgba(0, 0, 0, 0.1)'
                                        : '0 12px 35px rgba(231, 76, 60, 0.3)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px'
                                }}
                            >
                                {isSubmitting ? '⏳ Rejecting...' : '❌ Reject Submission'}
                            </button>

                            <button
                                type="button"
                                onClick={() => navigate('/teacher/view-submissions')}
                                style={{
                                    flex: '1',
                                    minWidth: '180px',
                                    padding: '16px',
                                    background: 'rgba(108, 117, 125, 0.9)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '12px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                ← Back to Submissions
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default GradeAssignment;
