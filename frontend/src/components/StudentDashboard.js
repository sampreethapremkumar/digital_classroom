import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const StudentDashboard = () => {
    const navigate = useNavigate();
    const [submissions, setSubmissions] = useState([]);

    useEffect(() => {
        fetchSubmissions();
    }, []);

    const fetchSubmissions = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/assignments/submissions');
            setSubmissions(response.data);
        } catch (error) {
            console.error('Error fetching submissions:', error);
        }
    };

    const [showAssignments, setShowAssignments] = useState(false);
    const [showSubmissions, setShowSubmissions] = useState(false);

    const cardStyle = {
        border: '1px solid #e0e0e0',
        borderRadius: '12px',
        padding: '20px',
        width: '300px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        transition: 'transform 0.2s, box-shadow 0.2s',
        cursor: 'pointer'
    };

    const cardHoverStyle = {
        transform: 'translateY(-5px)',
        boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
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
        <div style={{ padding: '20px', backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
            <h1 style={{ textAlign: 'center', color: '#333', marginBottom: '10px' }}>Student Dashboard</h1>
            <p style={{ textAlign: 'center', color: '#666', marginBottom: '30px' }}>Welcome, Student!</p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center', marginTop: '20px' }}>
                <div style={cardStyle} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                    <h3 style={{ color: '#333', marginBottom: '10px' }}>📚 View Notes</h3>
                    <p style={{ color: '#666', marginBottom: '15px' }}>View and download notes uploaded by teachers</p>
                    <button style={buttonStyle} onClick={() => navigate('/view-notes')}>View Notes</button>
                </div>

                <div style={cardStyle} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                    <h3 style={{ color: '#333', marginBottom: '10px' }}>📤 Submit Assignments</h3>
                    <p style={{ color: '#666', marginBottom: '15px' }}>Upload assignment solutions</p>
                    <button style={buttonStyle} onClick={() => navigate('/submit-assignments')}>Submit Assignment</button>
                </div>

                <div style={cardStyle} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                    <h3 style={{ color: '#333', marginBottom: '10px' }}>🧠 Take Quizzes</h3>
                    <p style={{ color: '#666', marginBottom: '15px' }}>Attempt quizzes assigned by teachers</p>
                    <button style={buttonStyle} onClick={() => navigate('/take-quizzes')}>Take Quiz</button>
                </div>

                <div style={cardStyle} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                    <h3 style={{ color: '#333', marginBottom: '10px' }}>📊 View Grades</h3>
                    <p style={{ color: '#666', marginBottom: '15px' }}>View marks for assignments and quizzes</p>
                    <button style={buttonStyle} onClick={() => navigate('/view-grades')}>View Grades</button>
                </div>

                <div style={cardStyle} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                    <h3 style={{ color: '#333', marginBottom: '10px' }}>💬 View Feedback</h3>
                    <p style={{ color: '#666', marginBottom: '15px' }}>Read teacher feedback on submissions</p>
                    <button style={buttonStyle} onClick={() => navigate('/view-feedback')}>View Feedback</button>
                </div>
            </div>

            {showSubmissions && (
                <div style={{ marginTop: '20px' }}>
                    <h3>My Submissions</h3>
                    <ul>
                        {submissions.map(submission => (
                            <li key={submission.id}>
                                Assignment: {submission.assignment?.title} - File: {submission.filePath} - Grade: {submission.grade} - Feedback: {submission.feedback}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default StudentDashboard;
