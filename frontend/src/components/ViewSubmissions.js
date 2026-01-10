import React, { useState, useEffect } from 'react';
import axios from '../api';
import { useNavigate } from 'react-router-dom';

const ViewSubmissions = () => {
    const [submissions, setSubmissions] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchSubmissions();
    }, []);

    const fetchSubmissions = async () => {
        try {
            const response = await axios.get('/api/assignments/submissions');
            setSubmissions(response.data);
        } catch (error) {
            console.error('Error fetching submissions:', error);
        }
    };

    const handleFileClick = (filename) => {
        // Use the configured API base URL for file downloads
        const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8080';
        const fileUrl = `${API_BASE_URL}/uploads/submissions/${filename}`;
        window.open(fileUrl, '_blank');
    };

    const tableStyle = {
        width: '100%',
        borderCollapse: 'collapse',
        marginTop: '20px'
    };

    const thStyle = {
        border: '1px solid #ddd',
        padding: '8px',
        textAlign: 'left',
        backgroundColor: '#f2f2f2'
    };

    const tdStyle = {
        border: '1px solid #ddd',
        padding: '8px'
    };

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
                        📋 Student Submissions
                    </h1>
                    <p style={{
                        margin: 0,
                        color: '#666',
                        fontSize: '16px',
                        fontWeight: '500'
                    }}>
                        Review and grade student assignment submissions
                    </p>
                </div>

                {submissions.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '60px 20px',
                        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                        borderRadius: '20px',
                        border: '2px dashed rgba(102, 126, 234, 0.3)'
                    }}>
                        <div style={{
                            fontSize: '64px',
                            marginBottom: '20px',
                            opacity: 0.6
                        }}>📭</div>
                        <h3 style={{
                            margin: '0 0 10px 0',
                            color: '#2c3e50',
                            fontSize: '24px',
                            fontWeight: '600'
                        }}>No Submissions Yet</h3>
                        <p style={{
                            margin: 0,
                            color: '#666',
                            fontSize: '16px'
                        }}>Students haven't submitted any assignments yet.</p>
                    </div>
                ) : (
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
                        borderRadius: '15px',
                        padding: '30px',
                        border: '1px solid rgba(102, 126, 234, 0.1)'
                    }}>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                            gap: '20px',
                            marginBottom: '30px'
                        }}>
                            {submissions.map(submission => (
                                <div
                                    key={submission.id}
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.9)',
                                        borderRadius: '15px',
                                        padding: '25px',
                                        boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
                                        border: '1px solid rgba(102, 126, 234, 0.1)',
                                        transition: 'all 0.3s ease',
                                        cursor: 'pointer'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-5px)';
                                        e.currentTarget.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.15)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.1)';
                                    }}
                                >
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'flex-start',
                                        marginBottom: '20px'
                                    }}>
                                        <div>
                                            <h3 style={{
                                                margin: '0 0 8px 0',
                                                color: '#2c3e50',
                                                fontSize: '20px',
                                                fontWeight: '700'
                                            }}>
                                                {submission.assignment?.title || 'Unknown Assignment'}
                                            </h3>
                                            <p style={{
                                                margin: 0,
                                                color: '#666',
                                                fontSize: '16px',
                                                fontWeight: '500'
                                            }}>
                                                👤 {submission.submittedBy?.username || 'Unknown Student'}
                                            </p>
                                        </div>
                                        <div style={{
                                            background: submission.grade !== null && submission.grade !== undefined
                                                ? (submission.gradeStatus === 'PUBLISHED'
                                                    ? 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
                                                    : 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)')
                                                : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                                            color: 'white',
                                            padding: '8px 16px',
                                            borderRadius: '20px',
                                            fontSize: '11px',
                                            fontWeight: '600',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px'
                                        }}>
                                            {submission.grade !== null && submission.grade !== undefined
                                                ? (submission.gradeStatus === 'PUBLISHED' ? '✅ Published' : '📝 Draft')
                                                : '⏳ Pending'}
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: '20px' }}>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            marginBottom: '10px'
                                        }}>
                                            <span style={{
                                                color: '#2c3e50',
                                                fontSize: '14px',
                                                fontWeight: '600',
                                                marginRight: '10px'
                                            }}>
                                                📎 File:
                                            </span>
                                            {submission.fileName ? (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleFileClick(submission.fileName);
                                                    }}
                                                    style={{
                                                        background: 'transparent',
                                                        border: 'none',
                                                        color: '#667eea',
                                                        fontWeight: '500',
                                                        cursor: 'pointer',
                                                        textDecoration: 'none',
                                                        padding: '0',
                                                        fontSize: '14px'
                                                    }}
                                                    onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                                                    onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                                                >
                                                    {submission.fileName}
                                                </button>
                                            ) : (
                                                <span style={{
                                                    color: '#e74c3c',
                                                    fontStyle: 'italic',
                                                    fontSize: '14px'
                                                }}>
                                                    No file submitted
                                                </span>
                                            )}
                                        </div>

                                        {submission.grade !== null && submission.grade !== undefined && (
                                            <div style={{
                                                background: 'linear-gradient(135deg, rgba(67, 233, 123, 0.1) 0%, rgba(56, 249, 215, 0.1) 100%)',
                                                borderRadius: '10px',
                                                padding: '15px',
                                                border: '1px solid rgba(67, 233, 123, 0.2)'
                                            }}>
                                                <div style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center'
                                                }}>
                                                    <span style={{
                                                        color: '#2c3e50',
                                                        fontSize: '16px',
                                                        fontWeight: '600'
                                                    }}>
                                                        Marks Awarded:
                                                    </span>
                                                    <span style={{
                                                        color: '#43e97b',
                                                        fontSize: '18px',
                                                        fontWeight: '700'
                                                    }}>
                                                        {submission.grade}/{submission.assignment?.totalMarks || 'N/A'}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/teacher/grade-assignment/${submission.id}`);
                                        }}
                                        style={{
                                            width: '100%',
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            color: 'white',
                                            border: 'none',
                                            padding: '12px 20px',
                                            borderRadius: '25px',
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease',
                                            boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                    >
                                        {submission.grade !== null && submission.grade !== undefined ? '🔄 Re-grade' : '📝 Grade Assignment'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div style={{ textAlign: 'center', marginTop: '40px' }}>
                    <button
                        onClick={() => navigate('/teacher')}
                        style={{
                            background: 'rgba(108, 117, 125, 0.9)',
                            color: 'white',
                            border: 'none',
                            padding: '16px 32px',
                            borderRadius: '25px',
                            fontSize: '16px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        ← Back to Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ViewSubmissions;
