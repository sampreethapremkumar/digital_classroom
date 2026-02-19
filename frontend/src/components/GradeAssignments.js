import React, { useState, useEffect } from 'react';
import axios from '../api';
import { useNavigate } from 'react-router-dom';

const GradeAssignments = () => {
    const navigate = useNavigate();
    const [submissions, setSubmissions] = useState([]);
    const [currentSubmission, setCurrentSubmission] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [gradingMode, setGradingMode] = useState('manual'); // 'manual' or 'rubric'
    const [marks, setMarks] = useState('');
    const [feedback, setFeedback] = useState('');
    const [rubricScores, setRubricScores] = useState([]);
    const [rubricData, setRubricData] = useState(null);
    const [gradeStatus, setGradeStatus] = useState('GRADED'); // GRADED or REJECTED
    const [rejectionReason, setRejectionReason] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showPublishConfirm, setShowPublishConfirm] = useState(false);
    const [gradeSummary, setGradeSummary] = useState(null);

    useEffect(() => {
        fetchSubmissions();
        fetchGradeSummary();
    }, []);

    useEffect(() => {
        if (submissions.length > 0 && currentIndex < submissions.length) {
            loadSubmission(submissions[currentIndex]);
        }
    }, [submissions, currentIndex]);

    const fetchSubmissions = async () => {
        try {
            const response = await axios.get('/api/assignments/submissions');
            setSubmissions(response.data);
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching submissions:', error);
            setError('Failed to load submissions');
            setIsLoading(false);
        }
    };

    const fetchGradeSummary = async () => {
        try {
            // Assuming we get assignment ID from current submission
            if (currentSubmission?.assignment?.id) {
                const response = await axios.get(`/api/teacher/assignments/${currentSubmission.assignment.id}/grade-summary`);
                setGradeSummary(response.data);
            }
        } catch (error) {
            console.error('Error fetching grade summary:', error);
        }
    };

    const loadSubmission = async (submission) => {
        try {
            const response = await axios.get(`/api/assignments/submissions/${submission.id}`);
            setCurrentSubmission(response.data);

            // Load rubric data if assignment has one
            if (response.data.assignment?.id) {
                try {
                    const rubricResponse = await axios.get(`/api/assignments/${response.data.assignment.id}/rubric`);
                    setRubricData(rubricResponse.data);
                } catch (error) {
                    setRubricData(null);
                }
            }

            // Reset form
            setMarks('');
            setFeedback('');
            setRubricScores([]);
            setGradeStatus('GRADED');
            setRejectionReason('');

            fetchGradeSummary();

        } catch (error) {
            console.error('Error loading submission:', error);
            setError('Failed to load submission details');
        }
    };

    const handleRubricScoreChange = (criteriaId, score) => {
        const existingIndex = rubricScores.findIndex(r => r.criteriaId === criteriaId);
        if (existingIndex >= 0) {
            const updatedScores = [...rubricScores];
            updatedScores[existingIndex] = { ...updatedScores[existingIndex], score };
            setRubricScores(updatedScores);
        } else {
            setRubricScores([...rubricScores, { criteriaId, score, comments: '' }]);
        }
    };

    const handleRubricCommentChange = (criteriaId, comments) => {
        const existingIndex = rubricScores.findIndex(r => r.criteriaId === criteriaId);
        if (existingIndex >= 0) {
            const updatedScores = [...rubricScores];
            updatedScores[existingIndex] = { ...updatedScores[existingIndex], comments };
            setRubricScores(updatedScores);
        } else {
            setRubricScores([...rubricScores, { criteriaId, score: 0, comments }]);
        }
    };

    const calculateTotalRubricMarks = () => {
        return rubricScores.reduce((total, score) => total + (score.score || 0), 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (gradeStatus === 'REJECTED' && !rejectionReason.trim()) {
            setError('Please provide a reason for rejection');
            return;
        }

        if (gradingMode === 'manual' && !marks.trim()) {
            setError('Please enter marks');
            return;
        }

        if (gradingMode === 'rubric' && rubricScores.length === 0) {
            setError('Please provide rubric scores');
            return;
        }

        setIsSubmitting(true);

        try {
            const payload = {
                submission_id: currentSubmission.id,
                feedback: feedback.trim(),
                marks: gradingMode === 'manual' ? parseFloat(marks) : calculateTotalRubricMarks(),
                rubricScores: gradingMode === 'rubric' ? rubricScores : null
            };

            if (gradeStatus === 'REJECTED') {
                // Handle rejection
                await axios.post(`/api/teacher/grades/${currentSubmission.id}/reject`, {
                    reason: rejectionReason
                });
                setSuccess('Submission rejected successfully!');
            } else {
                // Handle grading
                await axios.post('/api/teacher/grades', payload);
                setSuccess('Grade saved successfully (draft mode)!');
            }

            // Refresh submissions
            await fetchSubmissions();
            await fetchGradeSummary();

            // Auto-advance to next ungraded submission after 2 seconds
            setTimeout(() => {
                const nextUngradedIndex = submissions.findIndex((sub, index) =>
                    index > currentIndex && !sub.grade
                );
                if (nextUngradedIndex >= 0) {
                    setCurrentIndex(nextUngradedIndex);
                }
                setSuccess('');
            }, 2000);

        } catch (error) {
            console.error('Error submitting grade:', error);
            setError('Failed to submit grade. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePublish = async () => {
        try {
            await axios.post(`/api/teacher/grades/${currentSubmission.id}/publish`);
            setSuccess('Grade published successfully!');
            setShowPublishConfirm(false);

            // Refresh data
            await fetchSubmissions();
            await fetchGradeSummary();

        } catch (error) {
            console.error('Error publishing grade:', error);
            setError('Failed to publish grade.');
        }
    };

    const handleUnpublish = async () => {
        try {
            await axios.post(`/api/teacher/grades/${currentSubmission.id}/unpublish`);
            setSuccess('Grade unpublished successfully!');

            // Refresh data
            await fetchSubmissions();
            await fetchGradeSummary();

        } catch (error) {
            console.error('Error unpublishing grade:', error);
            setError('Failed to unpublish grade.');
        }
    };

    const handlePrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
            setError('');
            setSuccess('');
        }
    };

    const handleNext = () => {
        if (currentIndex < submissions.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setError('');
            setSuccess('');
        }
    };

    const handleFileClick = (filename) => {
        const baseUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8080';
        const fileUrl = `${baseUrl}/uploads/submissions/${filename}`;
        window.open(fileUrl, '_blank');
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString();
    };

    const getStatusBadge = (submission) => {
        if (!submission || (!submission.grade && !submission.feedback)) {
            return { text: '⏳ Pending', color: '#f39c12' };
        }
        return { text: '✓ Graded', color: '#27ae60' };
    };

    const getSubmissionStatusBadge = (submission) => {
        if (!submission || submission.isLateSubmission) {
            return { text: '⏰ Late', color: '#e74c3c' };
        }
        return { text: '✅ On-time', color: '#27ae60' };
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
                    }}>Loading submissions...</div>
                </div>
            </div>
        );
    }

    if (submissions.length === 0) {
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
                    }}>📭</div>
                    <div style={{
                        fontSize: '18px',
                        color: '#666',
                        fontWeight: '500',
                        marginBottom: '20px'
                    }}>No submissions available for grading</div>
                    <button
                        onClick={() => navigate('/teacher')}
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
                        ← Back to Dashboard
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
                maxWidth: '1200px',
                margin: '0 auto',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                borderRadius: '20px',
                padding: '40px',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
                {/* Header */}
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
                        📊 Comprehensive Grading System
                    </h1>
                    <p style={{
                        margin: 0,
                        color: '#666',
                        fontSize: '16px',
                        fontWeight: '500'
                    }}>
                        Submission {currentIndex + 1} of {submissions.length}
                    </p>
                </div>

                {/* Grade Summary Dashboard */}
                {gradeSummary && (
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 87, 34, 0.1) 100%)',
                        borderRadius: '15px',
                        padding: '20px',
                        marginBottom: '30px',
                        border: '1px solid rgba(255, 193, 7, 0.2)'
                    }}>
                        <h3 style={{ margin: '0 0 15px 0', color: '#2c3e50', fontSize: '20px', fontWeight: '700' }}>
                            📈 Grade Summary: {gradeSummary.assignmentTitle}
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#27ae60' }}>{gradeSummary.totalSubmissions}</div>
                                <div style={{ fontSize: '12px', color: '#666' }}>Total Submissions</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3498db' }}>{gradeSummary.gradedCount}</div>
                                <div style={{ fontSize: '12px', color: '#666' }}>Graded</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#e74c3c' }}>{gradeSummary.publishedCount}</div>
                                <div style={{ fontSize: '12px', color: '#666' }}>Published</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#9b59b6' }}>{gradeSummary.averageMarks}</div>
                                <div style={{ fontSize: '12px', color: '#666' }}>Average Marks</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '30px',
                    padding: '20px',
                    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                    borderRadius: '15px',
                    border: '1px solid rgba(102, 126, 234, 0.2)'
                }}>
                    <button onClick={handlePrevious} disabled={currentIndex === 0} style={{
                        background: currentIndex === 0 ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white', border: 'none', padding: '12px 20px', borderRadius: '25px',
                        cursor: currentIndex === 0 ? 'not-allowed' : 'pointer', fontWeight: '600', fontSize: '14px'
                    }}>← Previous</button>

                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '18px', fontWeight: '600', color: '#2c3e50', marginBottom: '5px' }}>
                            {currentSubmission?.assignment?.title || 'Loading...'}
                        </div>
                        <div style={{ fontSize: '14px', color: '#666' }}>
                            {currentSubmission?.submittedBy?.username || 'Unknown Student'}
                        </div>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '5px' }}>
                            <span style={{
                                padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold',
                                background: getStatusBadge(currentSubmission).color, color: 'white'
                            }}>
                                {getStatusBadge(currentSubmission).text}
                            </span>
                            <span style={{
                                padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold',
                                background: getSubmissionStatusBadge(currentSubmission).color, color: 'white'
                            }}>
                                {getSubmissionStatusBadge(currentSubmission).text}
                            </span>
                        </div>
                    </div>

                    <button onClick={handleNext} disabled={currentIndex === submissions.length - 1} style={{
                        background: currentIndex === submissions.length - 1 ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white', border: 'none', padding: '12px 20px', borderRadius: '25px',
                        cursor: currentIndex === submissions.length - 1 ? 'not-allowed' : 'pointer', fontWeight: '600', fontSize: '14px'
                    }}>Next →</button>
                </div>

                {/* Submission Details */}
                {currentSubmission && (
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                        borderRadius: '15px', padding: '25px', marginBottom: '30px', border: '1px solid rgba(102, 126, 234, 0.2)'
                    }}>
                        <h2 style={{ margin: '0 0 20px 0', color: '#2c3e50', fontSize: '24px', fontWeight: '700', borderBottom: '3px solid #667eea', paddingBottom: '10px' }}>
                            📋 Submission Details
                        </h2>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                            <div><strong>Student:</strong><br />👤 {currentSubmission.submittedBy?.username}</div>
                            <div><strong>Assignment:</strong><br />📝 {currentSubmission.assignment?.title}</div>
                            <div><strong>Submission Date:</strong><br />📅 {formatDate(currentSubmission.submitDate)}</div>
                            <div><strong>Total Marks:</strong><br />🎯 {currentSubmission.assignment?.totalMarks}</div>
                            <div><strong>Status:</strong><br />{getSubmissionStatusBadge(currentSubmission).text}</div>
                            <div><strong>File:</strong><br />
                                {currentSubmission.fileName ? (
                                    <button onClick={() => handleFileClick(currentSubmission.fileName)} style={{
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        color: 'white', border: 'none', padding: '8px 16px', borderRadius: '20px',
                                        cursor: 'pointer', fontSize: '12px', fontWeight: '600'
                                    }}>📄 View File</button>
                                ) : <span style={{ color: '#e74c3c' }}>❌ No file</span>}
                            </div>
                        </div>
                    </div>
                )}

                {/* Grading Mode Selection */}
                <div style={{
                    background: 'linear-gradient(135deg, rgba(155, 89, 182, 0.1) 0%, rgba(142, 68, 173, 0.1) 100%)',
                    borderRadius: '15px', padding: '25px', marginBottom: '30px', border: '1px solid rgba(155, 89, 182, 0.2)'
                }}>
                    <h3 style={{ margin: '0 0 20px 0', color: '#2c3e50', fontSize: '20px', fontWeight: '700' }}>🎯 Grading Mode</h3>
                    <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                        <button
                            onClick={() => setGradingMode('manual')}
                            style={{
                                padding: '12px 24px', borderRadius: '25px', border: 'none',
                                background: gradingMode === 'manual' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#f8f9fa',
                                color: gradingMode === 'manual' ? 'white' : '#666', fontWeight: '600', cursor: 'pointer'
                            }}
                        >
                            📝 Manual Grading
                        </button>
                        {rubricData && (
                            <button
                                onClick={() => setGradingMode('rubric')}
                                style={{
                                    padding: '12px 24px', borderRadius: '25px', border: 'none',
                                    background: gradingMode === 'rubric' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#f8f9fa',
                                    color: gradingMode === 'rubric' ? 'white' : '#666', fontWeight: '600', cursor: 'pointer'
                                }}
                            >
                                📊 Rubric-Based Grading
                            </button>
                        )}
                    </div>
                </div>

                {/* Grading Form */}
                <div style={{
                    background: 'linear-gradient(135deg, rgba(67, 233, 123, 0.1) 0%, rgba(56, 249, 215, 0.1) 100%)',
                    borderRadius: '15px', padding: '25px', border: '1px solid rgba(67, 233, 123, 0.2)'
                }}>
                    <h2 style={{ margin: '0 0 20px 0', color: '#2c3e50', fontSize: '24px', fontWeight: '700', borderBottom: '3px solid #43e97b', paddingBottom: '10px' }}>
                        ✏️ Grading Section
                    </h2>

                    {/* Status Selection */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600', color: '#2c3e50' }}>
                            📊 Grade Status
                        </label>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                <input type="radio" name="status" value="GRADED" checked={gradeStatus === 'GRADED'} onChange={(e) => setGradeStatus(e.target.value)} />
                                <span style={{ marginLeft: '5px' }}>✅ Grade & Save (Draft)</span>
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                <input type="radio" name="status" value="REJECTED" checked={gradeStatus === 'REJECTED'} onChange={(e) => setGradeStatus(e.target.value)} />
                                <span style={{ marginLeft: '5px' }}>❌ Reject Submission</span>
                            </label>
                        </div>
                    </div>

                    {(error || success) && (
                        <div style={{
                            background: error ? 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)' : 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                            color: error ? '#721c24' : '#155724', padding: '15px', borderRadius: '12px', marginBottom: '25px',
                            border: `1px solid ${error ? 'rgba(255, 107, 129, 0.3)' : 'rgba(40, 167, 69, 0.3)'}`,
                            fontSize: '14px', fontWeight: '500', textAlign: 'center'
                        }}>
                            {error || success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {gradingMode === 'manual' && gradeStatus === 'GRADED' && (
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#2c3e50' }}>
                                    Marks Awarded *
                                </label>
                                <input
                                    type="number" step="0.01" min="0" max={currentSubmission?.assignment?.totalMarks || 100}
                                    value={marks} onChange={(e) => setMarks(e.target.value)} required
                                    style={{
                                        width: '100%', padding: '15px', border: '2px solid rgba(102, 126, 234, 0.2)',
                                        borderRadius: '12px', fontSize: '16px', background: 'rgba(255, 255, 255, 0.8)',
                                        transition: 'all 0.3s ease', outline: 'none', boxSizing: 'border-box'
                                    }}
                                    placeholder={`Enter marks (max: ${currentSubmission?.assignment?.totalMarks || 'N/A'})`}
                                />
                            </div>
                        )}

                        {gradingMode === 'rubric' && gradeStatus === 'GRADED' && rubricData && (
                            <div style={{ marginBottom: '20px' }}>
                                <h4 style={{ marginBottom: '15px', color: '#2c3e50' }}>📊 Rubric: {rubricData.title}</h4>
                                <p style={{ color: '#666', marginBottom: '20px' }}>{rubricData.description}</p>
                                {rubricData.criteria?.map(criteria => (
                                    <div key={criteria.id} style={{
                                        background: 'rgba(255, 255, 255, 0.8)', padding: '15px', borderRadius: '10px',
                                        marginBottom: '15px', border: '1px solid rgba(102, 126, 234, 0.2)'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                            <strong style={{ color: '#2c3e50' }}>{criteria.criteriaName}</strong>
                                            <span style={{ color: '#666', fontSize: '14px' }}>Max: {criteria.maxPoints} points</span>
                                        </div>
                                        <p style={{ color: '#666', fontSize: '14px', marginBottom: '10px' }}>{criteria.description}</p>
                                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                            <input
                                                type="number" min="0" max={criteria.maxPoints} step="0.5"
                                                value={rubricScores.find(r => r.criteriaId === criteria.id)?.score || ''}
                                                onChange={(e) => handleRubricScoreChange(criteria.id, parseFloat(e.target.value) || 0)}
                                                style={{
                                                    width: '80px', padding: '8px', border: '1px solid #ddd', borderRadius: '5px',
                                                    fontSize: '14px', outline: 'none'
                                                }}
                                                placeholder="0"
                                            />
                                            <input
                                                type="text"
                                                value={rubricScores.find(r => r.criteriaId === criteria.id)?.comments || ''}
                                                onChange={(e) => handleRubricCommentChange(criteria.id, e.target.value)}
                                                style={{
                                                    flex: 1, padding: '8px', border: '1px solid #ddd', borderRadius: '5px',
                                                    fontSize: '14px', outline: 'none'
                                                }}
                                                placeholder="Comments..."
                                            />
                                        </div>
                                    </div>
                                ))}
                                <div style={{
                                    background: 'linear-gradient(135deg, rgba(67, 233, 123, 0.2) 0%, rgba(56, 249, 215, 0.2) 100%)',
                                    padding: '15px', borderRadius: '10px', marginTop: '15px', textAlign: 'center'
                                }}>
                                    <strong style={{ color: '#2c3e50', fontSize: '18px' }}>
                                        Total Rubric Score: {calculateTotalRubricMarks()} / {rubricData.criteria?.reduce((sum, c) => sum + c.maxPoints, 0) || 0}
                                    </strong>
                                </div>
                            </div>
                        )}

                        {gradeStatus === 'REJECTED' && (
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#2c3e50' }}>
                                    Rejection Reason *
                                </label>
                                <textarea
                                    value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} required
                                    rows="4" style={{
                                        width: '100%', padding: '15px', border: '2px solid rgba(231, 76, 60, 0.2)',
                                        borderRadius: '12px', fontSize: '16px', background: 'rgba(255, 255, 255, 0.8)',
                                        resize: 'vertical', outline: 'none', boxSizing: 'border-box'
                                    }}
                                    placeholder="Please provide a detailed reason for rejecting this submission..."
                                />
                            </div>
                        )}

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#2c3e50' }}>
                                💬 Feedback / Comments
                            </label>
                            <textarea
                                value={feedback} onChange={(e) => setFeedback(e.target.value)}
                                rows="4" style={{
                                    width: '100%', padding: '15px', border: '2px solid rgba(102, 126, 234, 0.2)',
                                    borderRadius: '12px', fontSize: '16px', background: 'rgba(255, 255, 255, 0.8)',
                                    resize: 'vertical', outline: 'none', boxSizing: 'border-box'
                                }}
                                placeholder="Provide constructive feedback, suggestions for improvement, or praise good work..."
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <button type="submit" disabled={isSubmitting} style={{
                                flex: '1', minWidth: '200px', padding: '16px',
                                background: isSubmitting ? 'linear-gradient(135deg, #ccc 0%, #999 100%)' : 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                                color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '700',
                                cursor: isSubmitting ? 'not-allowed' : 'pointer', transition: 'all 0.3s ease',
                                boxShadow: isSubmitting ? '0 8px 25px rgba(0, 0, 0, 0.1)' : '0 12px 35px rgba(67, 233, 123, 0.3)',
                                textTransform: 'uppercase', letterSpacing: '1px'
                            }}>
                                {isSubmitting ? '⏳ Processing...' : gradeStatus === 'REJECTED' ? '❌ Reject Submission' : '✅ Save Grade'}
                            </button>

                            {gradeStatus === 'GRADED' && (
                                <button type="button" onClick={() => setShowPublishConfirm(true)} style={{
                                    flex: '1', minWidth: '200px', padding: '16px',
                                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                                    color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '600',
                                    cursor: 'pointer', transition: 'all 0.3s ease'
                                }}>
                                    🚀 Publish Grade
                                </button>
                            )}

                            <button type="button" onClick={() => navigate('/teacher/view-submissions')} style={{
                                flex: '1', minWidth: '200px', padding: '16px',
                                background: 'rgba(108, 117, 125, 0.9)', color: 'white', border: 'none', borderRadius: '12px',
                                fontSize: '16px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.3s ease'
                            }}>
                                ← Back to Submissions
                            </button>
                        </div>
                    </form>
                </div>

                {/* Publish Confirmation Modal */}
                {showPublishConfirm && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        zIndex: 1000
                    }}>
                        <div style={{
                            background: 'white', padding: '30px', borderRadius: '20px',
                            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)', maxWidth: '400px', textAlign: 'center'
                        }}>
                            <h3 style={{ margin: '0 0 20px 0', color: '#2c3e50' }}>🚀 Publish Grade?</h3>
                            <p style={{ margin: '0 0 30px 0', color: '#666' }}>
                                This will make the grade visible to the student. This action cannot be easily undone.
                            </p>
                            <div style={{ display: 'flex', gap: '15px' }}>
                                <button onClick={handlePublish} style={{
                                    flex: 1, padding: '12px', background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                                    color: 'white', border: 'none', borderRadius: '10px', fontWeight: '600', cursor: 'pointer'
                                }}>✅ Publish</button>
                                <button onClick={() => setShowPublishConfirm(false)} style={{
                                    flex: 1, padding: '12px', background: '#ccc', color: '#666', border: 'none',
                                    borderRadius: '10px', fontWeight: '600', cursor: 'pointer'
                                }}>❌ Cancel</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GradeAssignments;
