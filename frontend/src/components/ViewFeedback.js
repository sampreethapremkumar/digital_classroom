import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ViewFeedback = () => {
    const [grades, setGrades] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchGrades();
    }, []);

    const fetchGrades = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/student/grades');
            setGrades(response.data);
        } catch (error) {
            console.error('Error fetching grades:', error);
        }
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
                maxWidth: '1200px',
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
                        💬 Teacher Feedback
                    </h1>
                    <p style={{
                        margin: 0,
                        color: '#666',
                        fontSize: '16px',
                        fontWeight: '500'
                    }}>
                        Read personalized feedback from your teachers
                    </p>
                </div>

                {grades.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '80px 20px',
                        background: 'linear-gradient(135deg, rgba(240, 147, 251, 0.1) 0%, rgba(245, 87, 108, 0.1) 100%)',
                        borderRadius: '20px',
                        border: '2px dashed rgba(240, 147, 251, 0.3)'
                    }}>
                        <div style={{
                            fontSize: '64px',
                            marginBottom: '20px',
                            opacity: 0.6
                        }}>💭</div>
                        <h3 style={{
                            margin: '0 0 10px 0',
                            color: '#2c3e50',
                            fontSize: '24px',
                            fontWeight: '600'
                        }}>No Feedback Yet</h3>
                        <p style={{
                            margin: 0,
                            color: '#666',
                            fontSize: '16px'
                        }}>Your teachers haven't provided feedback on your submissions yet.</p>
                    </div>
                ) : (
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(240, 147, 251, 0.05) 0%, rgba(245, 87, 108, 0.05) 100%)',
                        borderRadius: '15px',
                        padding: '30px',
                        border: '1px solid rgba(240, 147, 251, 0.1)'
                    }}>
                        {/* Feedback Summary */}
                        <div style={{
                            background: 'linear-gradient(135deg, rgba(240, 147, 251, 0.1) 0%, rgba(245, 87, 108, 0.1) 100%)',
                            borderRadius: '15px',
                            padding: '25px',
                            marginBottom: '30px',
                            border: '1px solid rgba(240, 147, 251, 0.2)',
                            textAlign: 'center'
                        }}>
                            <h3 style={{
                                margin: '0 0 15px 0',
                                color: '#2c3e50',
                                fontSize: '20px',
                                fontWeight: '700'
                            }}>
                                📊 Feedback Summary
                            </h3>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                                gap: '20px'
                            }}>
                                <div>
                                    <div style={{
                                        fontSize: '32px',
                                        fontWeight: '800',
                                        color: '#f093fb',
                                        marginBottom: '5px'
                                    }}>
                                        {grades.length}
                                    </div>
                                    <div style={{
                                        color: '#666',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px'
                                    }}>
                                        Total Feedback
                                    </div>
                                </div>
                                <div>
                                    <div style={{
                                        fontSize: '32px',
                                        fontWeight: '800',
                                        color: '#f093fb',
                                        marginBottom: '5px'
                                    }}>
                                        {grades.filter(g => g.feedback && g.feedback.trim()).length}
                                    </div>
                                    <div style={{
                                        color: '#666',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px'
                                    }}>
                                        With Comments
                                    </div>
                                </div>
                                <div>
                                    <div style={{
                                        fontSize: '32px',
                                        fontWeight: '800',
                                        color: '#f093fb',
                                        marginBottom: '5px'
                                    }}>
                                        {grades.filter(g => !g.feedback || !g.feedback.trim()).length}
                                    </div>
                                    <div style={{
                                        color: '#666',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px'
                                    }}>
                                        No Comments
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                            gap: '20px'
                        }}>
                            {grades.map(grade => (
                                <div
                                    key={grade.id}
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.9)',
                                        borderRadius: '15px',
                                        padding: '25px',
                                        boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
                                        border: '1px solid rgba(240, 147, 251, 0.1)',
                                        transition: 'all 0.3s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-3px)';
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
                                                fontSize: '18px',
                                                fontWeight: '700'
                                            }}>
                                                📝 {grade.submission?.assignment?.title || 'Assignment'}
                                            </h3>
                                            <p style={{
                                                margin: 0,
                                                color: '#666',
                                                fontSize: '14px'
                                            }}>
                                                Graded on {grade.gradedAt ? new Date(grade.gradedAt).toLocaleDateString() : 'N/A'}
                                            </p>
                                        </div>
                                        <div style={{
                                            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                                            color: 'white',
                                            padding: '8px 16px',
                                            borderRadius: '20px',
                                            fontSize: '14px',
                                            fontWeight: '600'
                                        }}>
                                            Marks: {grade.marks}/{grade.submission?.assignment?.totalMarks || 'N/A'}
                                        </div>
                                    </div>

                                    {/* Feedback Section */}
                                    {grade.feedback && grade.feedback.trim() ? (
                                        <div style={{
                                            background: 'linear-gradient(135deg, rgba(240, 147, 251, 0.1) 0%, rgba(245, 87, 108, 0.1) 100%)',
                                            borderRadius: '10px',
                                            padding: '15px',
                                            border: '1px solid rgba(240, 147, 251, 0.2)'
                                        }}>
                                            <h4 style={{
                                                margin: '0 0 10px 0',
                                                color: '#2c3e50',
                                                fontSize: '14px',
                                                fontWeight: '700'
                                            }}>
                                                💬 Teacher Feedback:
                                            </h4>
                                            <p style={{
                                                margin: 0,
                                                color: '#666',
                                                fontSize: '14px',
                                                lineHeight: '1.5'
                                            }}>
                                                {grade.feedback}
                                            </p>
                                        </div>
                                    ) : (
                                        <div style={{
                                            background: 'linear-gradient(135deg, rgba(245, 87, 108, 0.1) 0%, rgba(240, 147, 251, 0.1) 100%)',
                                            borderRadius: '10px',
                                            padding: '15px',
                                            border: '1px solid rgba(245, 87, 108, 0.2)',
                                            textAlign: 'center'
                                        }}>
                                            <span style={{
                                                color: '#f5576c',
                                                fontSize: '14px',
                                                fontStyle: 'italic'
                                            }}>
                                                📝 No written feedback provided
                                            </span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div style={{ textAlign: 'center', marginTop: '40px' }}>
                    <button
                        onClick={() => navigate('/student')}
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

export default ViewFeedback;
