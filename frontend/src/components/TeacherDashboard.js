import React from 'react';
import { useNavigate } from 'react-router-dom';

const TeacherDashboard = () => {
    const navigate = useNavigate();

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
            <h1 style={{ textAlign: 'center', color: '#333', marginBottom: '10px' }}>Teacher Dashboard</h1>
            <p style={{ textAlign: 'center', color: '#666', marginBottom: '30px' }}>Welcome, Teacher!</p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center', marginTop: '20px' }}>
                <div style={cardStyle} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                    <h3 style={{ color: '#333', marginBottom: '10px' }}>📤 Upload Notes</h3>
                    <p style={{ color: '#666', marginBottom: '15px' }}>Upload notes (PDF / Image)</p>
                    <button style={buttonStyle} onClick={() => navigate('/upload-notes')}>Upload Notes</button>
                </div>

                <div style={cardStyle} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                    <h3 style={{ color: '#333', marginBottom: '10px' }}>📝 Create Assignments</h3>
                    <p style={{ color: '#666', marginBottom: '15px' }}>Create new assignments</p>
                    <button style={buttonStyle} onClick={() => navigate('/create-assignment')}>Create Assignment</button>
                </div>

                <div style={cardStyle} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                    <h3 style={{ color: '#333', marginBottom: '10px' }}>🧠 Create Quizzes</h3>
                    <p style={{ color: '#666', marginBottom: '15px' }}>Create quizzes with questions</p>
                    <button style={buttonStyle} onClick={() => navigate('/create-quiz')}>Create Quiz</button>
                </div>

                <div style={cardStyle} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                    <h3 style={{ color: '#333', marginBottom: '10px' }}>📋 View Student Submissions</h3>
                    <p style={{ color: '#666', marginBottom: '15px' }}>View submitted assignments</p>
                    <button style={buttonStyle} onClick={() => navigate('/view-submissions')}>View Submissions</button>
                </div>

                <div style={cardStyle} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                    <h3 style={{ color: '#333', marginBottom: '10px' }}>📊 Grade Assignments</h3>
                    <p style={{ color: '#666', marginBottom: '15px' }}>Grade and provide feedback</p>
                    <button style={buttonStyle} onClick={() => navigate('/grade-assignments')}>Grade Assignments</button>
                </div>
            </div>
        </div>
    );
};

export default TeacherDashboard;
