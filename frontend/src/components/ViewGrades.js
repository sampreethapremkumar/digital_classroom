import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ViewGrades = () => {
    const [grades, setGrades] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchGrades();
    }, []);

    const fetchGrades = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/student/grades');
            console.log('Fetched grades:', response.data);
            console.log('First grade rubric scores:', response.data[0]?.submission?.rubricScores);
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
                        📊 My Grades
                    </h1>
                    <p style={{
                        margin: 0,
                        color: '#666',
                        fontSize: '16px',
                        fontWeight: '500'
                    }}>
                        View your assignment grades and feedback
                    </p>
                </div>

                {grades.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '80px 20px',
                        background: 'linear-gradient(135deg, rgba(67, 233, 123, 0.1) 0%, rgba(56, 249, 215, 0.1) 100%)',
                        borderRadius: '20px',
                        border: '2px dashed rgba(67, 233, 123, 0.3)'
                    }}>
                        <div style={{
                            fontSize: '64px',
                            marginBottom: '20px',
                            opacity: 0.6
                        }}>📈</div>
                        <h3 style={{
                            margin: '0 0 10px 0',
                            color: '#2c3e50',
                            fontSize: '24px',
                            fontWeight: '600'
                        }}>No Grades Yet</h3>
                        <p style={{
                            margin: 0,
                            color: '#666',
                            fontSize: '16px'
                        }}>Your teacher hasn't graded any of your submissions yet.</p>
                    </div>
                ) : (
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(67, 233, 123, 0.05) 0%, rgba(56, 249, 215, 0.05) 100%)',
                        borderRadius: '15px',
                        padding: '30px',
                        border: '1px solid rgba(67, 233, 123, 0.1)'
                    }}>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                            gap: '20px',
                            marginBottom: '30px'
                        }}>
                            {grades.map(grade => (
                                <div
                                    key={grade.id}
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.9)',
                                        borderRadius: '15px',
                                        padding: '25px',
                                        boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
                                        border: '1px solid rgba(67, 233, 123, 0.1)',
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
                                            background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                                            color: 'white',
                                            padding: '12px 20px',
                                            borderRadius: '25px',
                                            fontSize: '16px',
                                            fontWeight: '700',
                                            boxShadow: '0 8px 25px rgba(67, 233, 123, 0.3)'
                                        }}>
                                            {grade.marks}/{grade.submission?.assignment?.totalMarks || 'N/A'}
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: '20px' }}>
                                        <div style={{
                                            background: 'linear-gradient(135deg, rgba(67, 233, 123, 0.1) 0%, rgba(56, 249, 215, 0.1) 100%)',
                                            borderRadius: '10px',
                                            padding: '15px',
                                            border: '1px solid rgba(67, 233, 123, 0.2)'
                                        }}>
                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                marginBottom: '10px'
                                            }}>
                                                <span style={{
                                                    color: '#2c3e50',
                                                    fontSize: '14px',
                                                    fontWeight: '600'
                                                }}>
                                                    Score Percentage:
                                                </span>
                                                <span style={{
                                                    color: '#43e97b',
                                                    fontSize: '16px',
                                                    fontWeight: '700'
                                                }}>
                                                    {grade.submission?.assignment?.totalMarks ?
                                                        Math.round((grade.marks / grade.submission.assignment.totalMarks) * 100) : 'N/A'}%
                                                </span>
                                            </div>

                                            {/* Progress Bar */}
                                            <div style={{
                                                width: '100%',
                                                height: '8px',
                                                background: 'rgba(67, 233, 123, 0.2)',
                                                borderRadius: '4px',
                                                overflow: 'hidden'
                                            }}>
                                                <div style={{
                                                    width: `${grade.submission?.assignment?.totalMarks ?
                                                        Math.min((grade.marks / grade.submission.assignment.totalMarks) * 100, 100) : 0}%`,
                                                    height: '100%',
                                                    background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                                                    borderRadius: '4px',
                                                    transition: 'width 0.3s ease'
                                                }} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Rubric Breakdown */}
                                    {grade.submission?.rubricScores && grade.submission.rubricScores.length > 0 ? (
                                        <div style={{
                                            background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 87, 34, 0.1) 100%)',
                                            borderRadius: '10px',
                                            padding: '15px',
                                            border: '1px solid rgba(255, 193, 7, 0.2)',
                                            marginBottom: '15px'
                                        }}>
                                            <h4 style={{
                                                margin: '0 0 15px 0',
                                                color: '#2c3e50',
                                                fontSize: '16px',
                                                fontWeight: '700',
                                                borderBottom: '2px solid #ffc107',
                                                paddingBottom: '5px'
                                            }}>
                                                📋 Detailed Rubric Breakdown:
                                            </h4>
                                            <div style={{ display: 'grid', gap: '10px' }}>
                                                {grade.submission.rubricScores.map((rubricScore, index) => (
                                                    <div key={rubricScore.id || index} style={{
                                                        background: 'rgba(255, 255, 255, 0.8)',
                                                        borderRadius: '8px',
                                                        padding: '12px',
                                                        border: '1px solid rgba(255, 193, 7, 0.2)'
                                                    }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                                                            <span style={{
                                                                fontWeight: '600',
                                                                color: '#2c3e50',
                                                                fontSize: '14px'
                                                            }}>
                                                                {rubricScore.criteria?.criteriaName || `Criterion ${index + 1}`}
                                                            </span>
                                                            <span style={{
                                                                background: 'linear-gradient(135deg, #ffc107 0%, #ff8f00 100%)',
                                                                color: 'white',
                                                                padding: '4px 10px',
                                                                borderRadius: '12px',
                                                                fontSize: '12px',
                                                                fontWeight: '600'
                                                            }}>
                                                                {rubricScore.score || 0} / {rubricScore.criteria?.maxPoints || 0} pts
                                                            </span>
                                                        </div>
                                                        {rubricScore.comments && rubricScore.comments.trim() && (
                                                            <p style={{
                                                                margin: '5px 0 0 0',
                                                                color: '#666',
                                                                fontSize: '12px',
                                                                fontStyle: 'italic',
                                                                lineHeight: '1.4'
                                                            }}>
                                                                💬 "{rubricScore.comments}"
                                                            </p>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div style={{
                                            background: 'linear-gradient(135deg, rgba(149, 165, 166, 0.1) 0%, rgba(127, 140, 141, 0.1) 100%)',
                                            borderRadius: '10px',
                                            padding: '15px',
                                            border: '1px solid rgba(149, 165, 166, 0.2)',
                                            marginBottom: '15px'
                                        }}>
                                            <p style={{
                                                margin: 0,
                                                color: '#7f8c8d',
                                                fontSize: '14px',
                                                textAlign: 'center',
                                                fontStyle: 'italic'
                                            }}>
                                                📝 No detailed rubric breakdown available for this assignment.
                                            </p>
                                        </div>
                                    )}

                                    {/* Feedback Section */}
                                    {grade.feedback && (
                                        <div style={{
                                            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                                            borderRadius: '10px',
                                            padding: '15px',
                                            border: '1px solid rgba(102, 126, 234, 0.2)'
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
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Grade Summary */}
                        <div style={{
                            background: 'linear-gradient(135deg, rgba(67, 233, 123, 0.1) 0%, rgba(56, 249, 215, 0.1) 100%)',
                            borderRadius: '15px',
                            padding: '25px',
                            border: '1px solid rgba(67, 233, 123, 0.2)',
                            textAlign: 'center'
                        }}>
                            <h3 style={{
                                margin: '0 0 15px 0',
                                color: '#2c3e50',
                                fontSize: '20px',
                                fontWeight: '700'
                            }}>
                                📈 Grade Summary
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
                                        color: '#43e97b',
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
                                        Total Graded
                                    </div>
                                </div>
                                <div>
                                    <div style={{
                                        fontSize: '32px',
                                        fontWeight: '800',
                                        color: '#43e97b',
                                        marginBottom: '5px'
                                    }}>
                                        {grades.length > 0 ? Math.round(grades.reduce((sum, grade) => sum + grade.marks, 0) / grades.length) : 0}
                                    </div>
                                    <div style={{
                                        color: '#666',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px'
                                    }}>
                                        Average Score
                                    </div>
                                </div>
                                <div>
                                    <div style={{
                                        fontSize: '32px',
                                        fontWeight: '800',
                                        color: '#43e97b',
                                        marginBottom: '5px'
                                    }}>
                                        {grades.filter(g => g.feedback).length}
                                    </div>
                                    <div style={{
                                        color: '#666',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px'
                                    }}>
                                        With Feedback
                                    </div>
                                </div>
                            </div>
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

export default ViewGrades;
