import React, { useState, useEffect } from 'react';
import axios from '../api';
import { useNavigate } from 'react-router-dom';

const SubmitAssignments = () => {
    const [assignments, setAssignments] = useState([]);
    const [selectedAssignmentId, setSelectedAssignmentId] = useState('');
    const [file, setFile] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchAssignments();
    }, []);

    const fetchAssignments = async () => {
        console.log('SubmitAssignments: Attempting to fetch assignments');
        try {
            console.log('SubmitAssignments: Calling /api/student/assignments');
            const response = await axios.get('/api/student/assignments');
            console.log('SubmitAssignments: Student assignments response:', response.data);
            setAssignments(response.data);
        } catch (error) {
            console.error('SubmitAssignments: Error fetching student assignments:', error);
            console.error('SubmitAssignments: Error response:', error.response);
            // Fallback to general assignments endpoint if student endpoint fails
            try {
                console.log('SubmitAssignments: Falling back to /api/assignments');
                const fallbackResponse = await axios.get('/api/assignments');
                console.log('SubmitAssignments: Fallback response:', fallbackResponse.data);
                setAssignments(fallbackResponse.data);
            } catch (fallbackError) {
                console.error('SubmitAssignments: Fallback also failed:', fallbackError);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedAssignmentId || !file) {
            alert('Please select an assignment and upload a file');
            return;
        }

        const username = localStorage.getItem('username');
        if (!username) {
            alert('Please log in first');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('assignmentId', selectedAssignmentId);
        formData.append('username', username);

        try {
            const response = await axios.post('/api/assignments/submit', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            alert(response.data);
            setSelectedAssignmentId('');
            setFile(null);
        } catch (error) {
            console.error('Error submitting assignment:', error);
            alert(error.response?.data || 'Error submitting assignment');
        }
    };

    const formStyle = {
        display: 'flex',
        flexDirection: 'column',
        maxWidth: '400px',
        margin: '0 auto',
        padding: '20px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        backgroundColor: '#f9f9f9'
    };

    const inputStyle = {
        marginBottom: '10px',
        padding: '8px',
        border: '1px solid #ccc',
        borderRadius: '4px'
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
                        📤 Submit Assignment
                    </h1>
                    <p style={{
                        margin: 0,
                        color: '#666',
                        fontSize: '16px',
                        fontWeight: '500'
                    }}>
                        Choose an assignment and upload your work
                    </p>
                </div>

                {/* Available Assignments */}
                <div style={{ marginBottom: '40px' }}>
                    <h2 style={{
                        margin: '0 0 20px 0',
                        color: '#2c3e50',
                        fontSize: '24px',
                        fontWeight: '700',
                        borderBottom: '3px solid #667eea',
                        paddingBottom: '10px'
                    }}>
                        📚 Available Assignments
                    </h2>

                    {assignments.length === 0 ? (
                        <div style={{
                            textAlign: 'center',
                            padding: '60px 20px',
                            background: 'linear-gradient(135deg, rgba(79, 172, 254, 0.1) 0%, rgba(0, 242, 254, 0.1) 100%)',
                            borderRadius: '20px',
                            border: '2px dashed rgba(79, 172, 254, 0.3)'
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
                            }}>No Assignments Available</h3>
                            <p style={{
                                margin: 0,
                                color: '#666',
                                fontSize: '16px'
                            }}>Your teacher hasn't assigned any work yet.</p>
                        </div>
                    ) : (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                            gap: '20px'
                        }}>
                            {assignments.map(assignment => (
                                <div
                                    key={assignment.id}
                                    style={{
                                        background: 'linear-gradient(135deg, rgba(79, 172, 254, 0.1) 0%, rgba(0, 242, 254, 0.1) 100%)',
                                        borderRadius: '15px',
                                        padding: '20px',
                                        border: '1px solid rgba(79, 172, 254, 0.2)',
                                        transition: 'all 0.3s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-3px)';
                                        e.currentTarget.style.boxShadow = '0 10px 30px rgba(79, 172, 254, 0.2)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
                                >
                                    <h3 style={{
                                        margin: '0 0 10px 0',
                                        color: '#2c3e50',
                                        fontSize: '18px',
                                        fontWeight: '700'
                                    }}>
                                        📝 {assignment.title}
                                    </h3>
                                    <p style={{
                                        margin: '0 0 15px 0',
                                        color: '#666',
                                        fontSize: '14px',
                                        lineHeight: '1.5'
                                    }}>
                                        {assignment.description}
                                    </p>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <span style={{
                                            color: '#4facfe',
                                            fontSize: '12px',
                                            fontWeight: '600',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px'
                                        }}>
                                            Due: {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : 'No due date'}
                                        </span>
                                        <span style={{
                                            color: '#2c3e50',
                                            fontSize: '14px',
                                            fontWeight: '600'
                                        }}>
                                            🎯 {assignment.totalMarks || 'N/A'} marks
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Submission Form */}
                {assignments.length > 0 && (
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(67, 233, 123, 0.1) 0%, rgba(56, 249, 215, 0.1) 100%)',
                        borderRadius: '20px',
                        padding: '30px',
                        border: '1px solid rgba(67, 233, 123, 0.2)'
                    }}>
                        <h2 style={{
                            margin: '0 0 25px 0',
                            color: '#2c3e50',
                            fontSize: '24px',
                            fontWeight: '700',
                            borderBottom: '3px solid #43e97b',
                            paddingBottom: '10px'
                        }}>
                            📤 Submit Your Work
                        </h2>

                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '25px' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '8px',
                                    color: '#2c3e50',
                                    fontSize: '18px',
                                    fontWeight: '600'
                                }}>
                                    Select Assignment *
                                </label>
                                <select
                                    value={selectedAssignmentId}
                                    onChange={(e) => setSelectedAssignmentId(e.target.value)}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '15px',
                                        border: '2px solid rgba(79, 172, 254, 0.2)',
                                        borderRadius: '12px',
                                        fontSize: '16px',
                                        background: 'rgba(255, 255, 255, 0.8)',
                                        transition: 'all 0.3s ease',
                                        outline: 'none',
                                        boxSizing: 'border-box'
                                    }}
                                >
                                    <option value="">-- Choose an assignment --</option>
                                    {assignments.map(assignment => (
                                        <option key={assignment.id} value={assignment.id}>
                                            {assignment.title}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ marginBottom: '30px' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '8px',
                                    color: '#2c3e50',
                                    fontSize: '18px',
                                    fontWeight: '600'
                                }}>
                                    Upload Your File *
                                </label>
                                <div style={{
                                    border: '2px dashed rgba(79, 172, 254, 0.3)',
                                    borderRadius: '12px',
                                    padding: '40px',
                                    textAlign: 'center',
                                    background: 'rgba(255, 255, 255, 0.8)',
                                    transition: 'all 0.3s ease',
                                    cursor: 'pointer'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = 'rgba(79, 172, 254, 0.6)';
                                    e.currentTarget.style.background = 'rgba(79, 172, 254, 0.05)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = 'rgba(79, 172, 254, 0.3)';
                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.8)';
                                }}
                                onClick={() => document.getElementById('file-input').click()}
                                >
                                    <div style={{
                                        fontSize: '48px',
                                        marginBottom: '15px',
                                        color: '#4facfe'
                                    }}>
                                        📎
                                    </div>
                                    <div style={{
                                        fontSize: '18px',
                                        fontWeight: '600',
                                        color: '#2c3e50',
                                        marginBottom: '10px'
                                    }}>
                                        {file ? file.name : 'Click to upload your assignment'}
                                    </div>
                                    <div style={{
                                        fontSize: '14px',
                                        color: '#666'
                                    }}>
                                        Supported formats: PDF, DOCX, ZIP (Max: 10MB)
                                    </div>
                                    <input
                                        id="file-input"
                                        type="file"
                                        onChange={(e) => setFile(e.target.files[0])}
                                        required
                                        style={{ display: 'none' }}
                                        accept=".pdf,.docx,.zip"
                                    />
                                </div>
                                {file && (
                                    <div style={{
                                        marginTop: '10px',
                                        padding: '10px',
                                        background: 'linear-gradient(135deg, rgba(67, 233, 123, 0.1) 0%, rgba(56, 249, 215, 0.1) 100%)',
                                        borderRadius: '8px',
                                        border: '1px solid rgba(67, 233, 123, 0.2)'
                                    }}>
                                        <span style={{
                                            color: '#43e97b',
                                            fontSize: '14px',
                                            fontWeight: '600'
                                        }}>
                                            ✓ Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div style={{
                                display: 'flex',
                                gap: '15px',
                                justifyContent: 'center',
                                flexWrap: 'wrap'
                            }}>
                                <button
                                    type="submit"
                                    style={{
                                        flex: '1',
                                        minWidth: '200px',
                                        padding: '16px',
                                        background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '12px',
                                        fontSize: '16px',
                                        fontWeight: '700',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        boxShadow: '0 12px 35px rgba(67, 233, 123, 0.3)',
                                        textTransform: 'uppercase',
                                        letterSpacing: '1px'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                >
                                    🚀 Submit Assignment
                                </button>

                                <button
                                    type="button"
                                    onClick={() => navigate('/student')}
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
                        </form>
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

export default SubmitAssignments;
