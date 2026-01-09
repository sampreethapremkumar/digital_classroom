import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ViewNotes from './ViewNotes';
import SubmitAssignments from './SubmitAssignments';
import TakeQuizzes from './TakeQuizzes';
import ViewGrades from './ViewGrades';
import ViewFeedback from './ViewFeedback';

const StudentLayout = () => {
    const [activeItem, setActiveItem] = useState('dashboard');
    const [username, setUsername] = useState('');
    const [stats, setStats] = useState({
        notesAvailable: 0,
        assignmentsPending: 0,
        quizzesAvailable: 0,
        gradesPublished: 0
    });
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Get username from localStorage or decode from JWT token
        let storedUsername = localStorage.getItem('username');

        if (!storedUsername) {
            // Try to decode username from JWT token
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    storedUsername = payload.sub || payload.username;
                    if (storedUsername) {
                        localStorage.setItem('username', storedUsername);
                    }
                } catch (error) {
                    // JWT decode failed, continue with fallback
                }
            }
        }

        if (storedUsername && storedUsername !== 'undefined') {
            setUsername(storedUsername);
        } else {
            // Fallback: use generic student name if role is student
            const role = localStorage.getItem('role');
            if (role === 'STUDENT') {
                setUsername('Student');
            }
        }
    }, []);

    useEffect(() => {
        // Set active item based on current path
        const path = location.pathname;
        if (path === '/student' || path === '/student/') setActiveItem('dashboard');
        else if (path === '/student/view-notes') setActiveItem('view-notes');
        else if (path === '/student/submit-assignments') setActiveItem('submit-assignments');
        else if (path === '/student/take-quizzes') setActiveItem('take-quizzes');
        else if (path === '/student/view-grades') setActiveItem('view-grades');
        else if (path === '/student/view-feedback') setActiveItem('view-feedback');
    }, [location.pathname]);

    useEffect(() => {
        // Fetch stats for dashboard
        if (activeItem === 'dashboard') {
            fetch('http://localhost:8080/api/student/stats')
                .then(response => response.json())
                .then(data => setStats(data))
                .catch(error => console.error('Error fetching stats:', error));
        }
    }, [activeItem]);

    const handleMenuClick = (item, path) => {
        setActiveItem(item);
        navigate(path);
    };

    const handleLogout = () => {
        // Implement logout logic
        navigate('/login');
    };

    const renderContent = () => {
        switch (activeItem) {
            case 'dashboard':
                return <StudentDashboardContent stats={stats} />;
            case 'view-notes':
                return <ViewNotes />;
            case 'submit-assignments':
                return <SubmitAssignments />;
            case 'take-quizzes':
                return <TakeQuizzes />;
            case 'view-grades':
                return <ViewGrades />;
            case 'view-feedback':
                return <ViewFeedback />;
            default:
                return <StudentDashboardContent stats={stats} />;
        }
    };

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: '📊', path: '/student' },
        { id: 'view-notes', label: 'View Notes', icon: '📚', path: '/student/view-notes' },
        { id: 'submit-assignments', label: 'Submit Assignments', icon: '📤', path: '/student/submit-assignments' },
        { id: 'take-quizzes', label: 'Take Quizzes', icon: '🧠', path: '/student/take-quizzes' },
        { id: 'view-grades', label: 'View Grades', icon: '📊', path: '/student/view-grades' },
        { id: 'view-feedback', label: 'View Feedback', icon: '💬', path: '/student/view-feedback' }
    ];

    return (
        <div style={{
            display: 'flex',
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        }}>
            {/* Sidebar */}
            <div style={{
                width: '280px',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                borderRight: '1px solid rgba(255, 255, 255, 0.2)',
                padding: '30px 0',
                position: 'fixed',
                height: '100vh',
                overflowY: 'auto',
                boxShadow: '2px 0 20px rgba(0, 0, 0, 0.1)',
                borderRadius: '0 20px 20px 0'
            }}>
                <div style={{
                    padding: '0 30px 30px',
                    borderBottom: '2px solid rgba(102, 126, 234, 0.1)',
                    marginBottom: '30px'
                }}>
                    <h2 style={{
                        margin: 0,
                        fontSize: '28px',
                        fontWeight: '700',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        letterSpacing: '-0.5px'
                    }}>
                        Student Portal
                    </h2>
                    <p style={{
                        margin: '8px 0 0 0',
                        color: '#666',
                        fontSize: '14px',
                        fontWeight: '500'
                    }}>
                        Access your learning materials
                    </p>
                </div>
                <nav>
                    {menuItems.map(item => (
                        <div
                            key={item.id}
                            onClick={() => handleMenuClick(item.id, item.path)}
                            style={{
                                padding: '18px 30px',
                                cursor: 'pointer',
                                backgroundColor: activeItem === item.id
                                    ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)'
                                    : 'transparent',
                                borderLeft: activeItem === item.id
                                    ? '4px solid #667eea'
                                    : '4px solid transparent',
                                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                margin: '5px 15px',
                                borderRadius: '12px',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                            onMouseEnter={(e) => {
                                if (activeItem !== item.id) {
                                    e.currentTarget.style.background = 'rgba(102, 126, 234, 0.05)';
                                    e.currentTarget.style.transform = 'translateX(5px)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (activeItem !== item.id) {
                                    e.currentTarget.style.background = 'transparent';
                                    e.currentTarget.style.transform = 'translateX(0)';
                                }
                            }}
                        >
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                fontSize: '16px',
                                fontWeight: activeItem === item.id ? '600' : '500',
                                color: activeItem === item.id ? '#667eea' : '#555',
                                transition: 'all 0.3s ease'
                            }}>
                                <span style={{
                                    marginRight: '15px',
                                    fontSize: '20px',
                                    filter: activeItem === item.id ? 'brightness(1.2)' : 'brightness(0.8)'
                                }}>
                                    {item.icon}
                                </span>
                                {item.label}
                            </div>
                            {activeItem === item.id && (
                                <div style={{
                                    position: 'absolute',
                                    right: '15px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    width: '6px',
                                    height: '6px',
                                    backgroundColor: '#667eea',
                                    borderRadius: '50%',
                                    animation: 'pulse 2s infinite'
                                }} />
                            )}
                        </div>
                    ))}
                </nav>
            </div>

            {/* Main Content */}
            <div style={{
                flex: 1,
                marginLeft: '280px',
                display: 'flex',
                flexDirection: 'column'
            }}>
                {/* Header */}
                <header style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    padding: '20px 40px',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '0 0 20px 20px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{
                            width: '50px',
                            height: '50px',
                            background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                            borderRadius: '15px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: '20px',
                            boxShadow: '0 8px 25px rgba(67, 233, 123, 0.3)'
                        }}>
                            <span style={{ fontSize: '24px', color: 'white' }}>🎓</span>
                        </div>
                        <div>
                            <h1 style={{
                                margin: 0,
                                color: '#2c3e50',
                                fontSize: '32px',
                                fontWeight: '700',
                                letterSpacing: '-0.5px'
                            }}>
                                Welcome back, Student!
                            </h1>
                            <p style={{
                                margin: '5px 0 0 0',
                                color: '#666',
                                fontSize: '16px',
                                fontWeight: '500'
                            }}>
                                Academic Year 2025 • Continue your learning journey
                            </p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            background: 'rgba(67, 233, 123, 0.1)',
                            padding: '12px 20px',
                            borderRadius: '25px',
                            border: '1px solid rgba(67, 233, 123, 0.2)'
                        }}>
                            <span style={{
                                color: '#43e97b',
                                fontWeight: '600',
                                fontSize: '16px',
                                marginRight: '8px'
                            }}>
                                👋
                            </span>
                            <span style={{
                                color: '#2c3e50',
                                fontWeight: '600',
                                fontSize: '16px'
                            }}>
                                {username || 'Student'}
                            </span>
                        </div>
                        <button style={{
                            background: 'rgba(255, 255, 255, 0.9)',
                            border: '1px solid rgba(102, 126, 234, 0.2)',
                            borderRadius: '12px',
                            padding: '12px',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            <span style={{ fontSize: '18px' }}>👤</span>
                        </button>
                        <button style={{
                            background: 'rgba(255, 255, 255, 0.9)',
                            border: '1px solid rgba(102, 126, 234, 0.2)',
                            borderRadius: '12px',
                            padding: '12px',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
                            position: 'relative'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            <span style={{ fontSize: '18px' }}>🔔</span>
                            <div style={{
                                position: 'absolute',
                                top: '8px',
                                right: '8px',
                                width: '8px',
                                height: '8px',
                                backgroundColor: '#e74c3c',
                                borderRadius: '50%',
                                border: '2px solid white'
                            }} />
                        </button>
                        <button
                            onClick={handleLogout}
                            style={{
                                background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
                                color: 'white',
                                border: 'none',
                                padding: '12px 24px',
                                borderRadius: '25px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                fontSize: '14px',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 8px 25px rgba(231, 76, 60, 0.3)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 12px 35px rgba(231, 76, 60, 0.4)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 8px 25px rgba(231, 76, 60, 0.3)';
                            }}
                        >
                            Logout
                        </button>
                    </div>
                </header>

                {/* Content Area */}
                <main style={{
                    flex: 1,
                    padding: '40px',
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
                    overflowY: 'auto',
                    borderRadius: '20px 0 0 0'
                }}>
                    {renderContent()}
                </main>
            </div>

            <style jsx>{`
                @keyframes pulse {
                    0% { opacity: 1; }
                    50% { opacity: 0.5; }
                    100% { opacity: 1; }
                }
            `}</style>
        </div>
    );
};

const StudentDashboardContent = ({ stats }) => {
    const cards = [
        {
            title: 'Notes Available',
            count: stats.notesAvailable,
            icon: '📚',
            gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            shadowColor: 'rgba(102, 126, 234, 0.3)'
        },
        {
            title: 'Assignments Pending',
            count: stats.assignmentsPending,
            icon: '📝',
            gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            shadowColor: 'rgba(240, 147, 251, 0.3)'
        },
        {
            title: 'Quizzes Available',
            count: stats.quizzesAvailable,
            icon: '🧠',
            gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            shadowColor: 'rgba(79, 172, 254, 0.3)'
        },
        {
            title: 'Grades Published',
            count: stats.gradesPublished,
            icon: '📊',
            gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            shadowColor: 'rgba(67, 233, 123, 0.3)'
        }
    ];

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(20px)',
                borderRadius: '20px',
                padding: '40px',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '50px' }}>
                    <h1 style={{
                        color: '#2c3e50',
                        fontSize: '42px',
                        fontWeight: '800',
                        margin: '0 0 10px 0',
                        letterSpacing: '-1px',
                        background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                    }}>
                        🎓 Student Dashboard
                    </h1>
                    <p style={{
                        color: '#666',
                        fontSize: '18px',
                        fontWeight: '500',
                        margin: 0
                    }}>
                        Track your academic progress and assignments
                    </p>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                    gap: '30px',
                    marginBottom: '40px'
                }}>
                    {cards.map((card, index) => (
                        <div
                            key={index}
                            style={{
                                background: card.gradient,
                                color: 'white',
                                padding: '35px',
                                borderRadius: '25px',
                                boxShadow: `0 15px 40px ${card.shadowColor}`,
                                textAlign: 'center',
                                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                cursor: 'pointer',
                                position: 'relative',
                                overflow: 'hidden',
                                border: '2px solid rgba(255, 255, 255, 0.1)'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                                e.currentTarget.style.boxShadow = `0 25px 60px ${card.shadowColor}`;
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                e.currentTarget.style.boxShadow = `0 15px 40px ${card.shadowColor}`;
                            }}
                        >
                            <div style={{
                                position: 'absolute',
                                top: '-20px',
                                right: '-20px',
                                width: '80px',
                                height: '80px',
                                background: 'rgba(255, 255, 255, 0.1)',
                                borderRadius: '50%',
                                backdropFilter: 'blur(10px)'
                            }} />
                            <div style={{
                                fontSize: '56px',
                                marginBottom: '20px',
                                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                                animation: `float 3s ease-in-out infinite ${index * 0.5}s`
                            }}>
                                {card.icon}
                            </div>
                            <h3 style={{
                                margin: '0 0 15px 0',
                                fontSize: '20px',
                                fontWeight: '600',
                                letterSpacing: '0.5px',
                                textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}>
                                {card.title}
                            </h3>
                            <div style={{
                                fontSize: '48px',
                                fontWeight: '800',
                                margin: 0,
                                textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                fontVariantNumeric: 'tabular-nums'
                            }}>
                                {(card.count || 0).toLocaleString()}
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{
                    background: 'linear-gradient(135deg, rgba(67, 233, 123, 0.1) 0%, rgba(56, 249, 215, 0.1) 100%)',
                    borderRadius: '20px',
                    padding: '30px',
                    border: '1px solid rgba(67, 233, 123, 0.2)',
                    textAlign: 'center'
                }}>
                    <h3 style={{
                        color: '#2c3e50',
                        fontSize: '24px',
                        fontWeight: '700',
                        margin: '0 0 10px 0'
                    }}>
                        🚀 Ready to excel today?
                    </h3>
                    <p style={{
                        color: '#666',
                        fontSize: '16px',
                        fontWeight: '500',
                        margin: 0,
                        lineHeight: '1.6'
                    }}>
                        Access notes, submit assignments, take quizzes, and track your grades.
                        Your academic success starts here! 🌟
                    </p>
                </div>
            </div>

            <style jsx>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                }
            `}</style>
        </div>
    );
};

export default StudentLayout;
