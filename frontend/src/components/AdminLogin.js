import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await axios.post('http://localhost:8080/api/auth/login', { username, password });
            const user = response.data;

            // Strict admin check
            if (user.role !== 'SUPER_ADMIN') {
                setError('Access denied. Admin privileges required.');
                return;
            }

            localStorage.setItem('token', user.token);
            localStorage.setItem('role', user.role);
            localStorage.setItem('username', user.username || username);

            navigate('/admin/dashboard');
        } catch (error) {
            console.error('Admin login error:', error);
            const errorMessage = error.response?.data;
            if (errorMessage === 'Your account is pending admin approval') {
                setError('Admin account is not approved.');
            } else {
                setError(errorMessage || 'Invalid admin credentials.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            padding: '20px'
        }}>
            <div style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                borderRadius: '25px',
                padding: '50px',
                boxShadow: '0 25px 80px rgba(0, 0, 0, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                width: '100%',
                maxWidth: '450px',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Decorative elements */}
                <div style={{
                    position: 'absolute',
                    top: '-30px',
                    right: '-30px',
                    width: '100px',
                    height: '100px',
                    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%)',
                    borderRadius: '50%',
                    backdropFilter: 'blur(10px)'
                }} />
                <div style={{
                    position: 'absolute',
                    bottom: '-20px',
                    left: '-20px',
                    width: '80px',
                    height: '80px',
                    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                    borderRadius: '50%',
                    backdropFilter: 'blur(10px)'
                }} />

                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 20px',
                        boxShadow: '0 15px 35px rgba(102, 126, 234, 0.3)',
                        animation: 'float 3s ease-in-out infinite'
                    }}>
                        <span style={{ fontSize: '36px', color: 'white' }}>👑</span>
                    </div>
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
                        Admin Login
                    </h1>
                    <p style={{
                        margin: 0,
                        color: '#666',
                        fontSize: '16px',
                        fontWeight: '500'
                    }}>
                        Access the Super Admin Dashboard
                    </p>
                </div>

                {error && (
                    <div style={{
                        background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
                        color: '#721c24',
                        padding: '15px',
                        borderRadius: '12px',
                        marginBottom: '25px',
                        border: '1px solid rgba(255, 107, 129, 0.3)',
                        fontSize: '14px',
                        fontWeight: '500',
                        textAlign: 'center'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} style={{ position: 'relative', zIndex: 2 }}>
                    <div style={{ marginBottom: '25px' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '8px',
                            color: '#2c3e50',
                            fontSize: '16px',
                            fontWeight: '600',
                            letterSpacing: '0.5px'
                        }}>
                            Admin Username
                        </label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                style={{
                                    width: '100%',
                                    padding: '18px 20px',
                                    border: '2px solid rgba(102, 126, 234, 0.2)',
                                    borderRadius: '15px',
                                    fontSize: '16px',
                                    fontWeight: '500',
                                    background: 'rgba(255, 255, 255, 0.8)',
                                    backdropFilter: 'blur(10px)',
                                    transition: 'all 0.3s ease',
                                    outline: 'none',
                                    boxSizing: 'border-box'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = '#667eea';
                                    e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                                    e.target.style.transform = 'translateY(-2px)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = 'rgba(102, 126, 234, 0.2)';
                                    e.target.style.boxShadow = 'none';
                                    e.target.style.transform = 'translateY(0)';
                                }}
                                placeholder="Enter admin username"
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '35px' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '8px',
                            color: '#2c3e50',
                            fontSize: '16px',
                            fontWeight: '600',
                            letterSpacing: '0.5px'
                        }}>
                            Admin Password
                        </label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                style={{
                                    width: '100%',
                                    padding: '18px 20px',
                                    border: '2px solid rgba(102, 126, 234, 0.2)',
                                    borderRadius: '15px',
                                    fontSize: '16px',
                                    fontWeight: '500',
                                    background: 'rgba(255, 255, 255, 0.8)',
                                    backdropFilter: 'blur(10px)',
                                    transition: 'all 0.3s ease',
                                    outline: 'none',
                                    boxSizing: 'border-box'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = '#667eea';
                                    e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                                    e.target.style.transform = 'translateY(-2px)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = 'rgba(102, 126, 234, 0.2)';
                                    e.target.style.boxShadow = 'none';
                                    e.target.style.transform = 'translateY(0)';
                                }}
                                placeholder="Enter admin password"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        style={{
                            width: '100%',
                            padding: '18px',
                            background: isLoading
                                ? 'linear-gradient(135deg, #ccc 0%, #999 100%)'
                                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '15px',
                            fontSize: '18px',
                            fontWeight: '700',
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                            transition: 'all 0.3s ease',
                            boxShadow: isLoading
                                ? '0 8px 25px rgba(0, 0, 0, 0.1)'
                                : '0 15px 35px rgba(102, 126, 234, 0.3)',
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            marginBottom: '25px'
                        }}
                        onMouseEnter={(e) => {
                            if (!isLoading) {
                                e.currentTarget.style.transform = 'translateY(-3px)';
                                e.currentTarget.style.boxShadow = '0 20px 45px rgba(102, 126, 234, 0.4)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!isLoading) {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 15px 35px rgba(102, 126, 234, 0.3)';
                            }
                        }}
                    >
                        {isLoading ? 'Authenticating...' : 'Access Admin Panel'}
                    </button>
                </form>

                <div style={{
                    textAlign: 'center',
                    paddingTop: '20px',
                    borderTop: '1px solid rgba(102, 126, 234, 0.1)'
                }}>
                    <p style={{
                        margin: '0 0 10px 0',
                        color: '#666',
                        fontSize: '14px',
                        fontWeight: '500'
                    }}>
                        Not an admin?
                    </p>
                    <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                        <button
                            onClick={() => navigate('/teacher/login')}
                            style={{
                                padding: '8px 16px',
                                background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: '600'
                            }}
                        >
                            Teacher Login
                        </button>
                        <button
                            onClick={() => navigate('/student/login')}
                            style={{
                                padding: '8px 16px',
                                background: 'linear-gradient(135deg, #2196f3 0%, #21CBF3 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: '600'
                            }}
                        >
                            Student Login
                        </button>
                    </div>
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

export default AdminLogin;
