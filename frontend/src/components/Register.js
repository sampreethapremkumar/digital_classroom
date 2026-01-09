import React, { useState } from 'react';
import axios from '../api';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('STUDENT');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccess('');

        try {
            await axios.post('/api/auth/register', { username, password, email, role });
            setSuccess('Registration successful! Redirecting to login...');
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (error) {
            setError('Registration failed. Please try again.');
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
                maxWidth: '500px',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Decorative elements */}
                <div style={{
                    position: 'absolute',
                    top: '-25px',
                    left: '-25px',
                    width: '90px',
                    height: '90px',
                    background: 'linear-gradient(135deg, rgba(67, 233, 123, 0.2) 0%, rgba(56, 249, 215, 0.2) 100%)',
                    borderRadius: '50%',
                    backdropFilter: 'blur(10px)'
                }} />
                <div style={{
                    position: 'absolute',
                    bottom: '-30px',
                    right: '-30px',
                    width: '120px',
                    height: '120px',
                    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%)',
                    borderRadius: '50%',
                    backdropFilter: 'blur(10px)'
                }} />

                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                        borderRadius: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 20px',
                        boxShadow: '0 15px 35px rgba(67, 233, 123, 0.3)',
                        animation: 'float 3s ease-in-out infinite'
                    }}>
                        <span style={{ fontSize: '36px', color: 'white' }}>🌟</span>
                    </div>
                    <h1 style={{
                        margin: '0 0 10px 0',
                        fontSize: '36px',
                        fontWeight: '800',
                        background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        letterSpacing: '-1px'
                    }}>
                        Join Us Today
                    </h1>
                    <p style={{
                        margin: 0,
                        color: '#666',
                        fontSize: '16px',
                        fontWeight: '500'
                    }}>
                        Create your Digital Classroom account
                    </p>
                </div>

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

                <form onSubmit={handleRegister} style={{ position: 'relative', zIndex: 2 }}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '8px',
                            color: '#2c3e50',
                            fontSize: '16px',
                            fontWeight: '600',
                            letterSpacing: '0.5px'
                        }}>
                            Username
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
                                    border: '2px solid rgba(67, 233, 123, 0.2)',
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
                                    e.target.style.borderColor = '#43e97b';
                                    e.target.style.boxShadow = '0 0 0 3px rgba(67, 233, 123, 0.1)';
                                    e.target.style.transform = 'translateY(-2px)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = 'rgba(67, 233, 123, 0.2)';
                                    e.target.style.boxShadow = 'none';
                                    e.target.style.transform = 'translateY(0)';
                                }}
                                placeholder="Choose a username"
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '8px',
                            color: '#2c3e50',
                            fontSize: '16px',
                            fontWeight: '600',
                            letterSpacing: '0.5px'
                        }}>
                            Email Address
                        </label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                style={{
                                    width: '100%',
                                    padding: '18px 20px',
                                    border: '2px solid rgba(67, 233, 123, 0.2)',
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
                                    e.target.style.borderColor = '#43e97b';
                                    e.target.style.boxShadow = '0 0 0 3px rgba(67, 233, 123, 0.1)';
                                    e.target.style.transform = 'translateY(-2px)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = 'rgba(67, 233, 123, 0.2)';
                                    e.target.style.boxShadow = 'none';
                                    e.target.style.transform = 'translateY(0)';
                                }}
                                placeholder="Enter your email"
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '8px',
                            color: '#2c3e50',
                            fontSize: '16px',
                            fontWeight: '600',
                            letterSpacing: '0.5px'
                        }}>
                            Password
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
                                    border: '2px solid rgba(67, 233, 123, 0.2)',
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
                                    e.target.style.borderColor = '#43e97b';
                                    e.target.style.boxShadow = '0 0 0 3px rgba(67, 233, 123, 0.1)';
                                    e.target.style.transform = 'translateY(-2px)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = 'rgba(67, 233, 123, 0.2)';
                                    e.target.style.boxShadow = 'none';
                                    e.target.style.transform = 'translateY(0)';
                                }}
                                placeholder="Create a password"
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '35px' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '12px',
                            color: '#2c3e50',
                            fontSize: '16px',
                            fontWeight: '600',
                            letterSpacing: '0.5px'
                        }}>
                            I am a...
                        </label>
                        <div style={{ display: 'flex', gap: '15px' }}>
                            <label style={{
                                flex: 1,
                                position: 'relative',
                                cursor: 'pointer'
                            }}>
                                <input
                                    type="radio"
                                    value="STUDENT"
                                    checked={role === 'STUDENT'}
                                    onChange={(e) => setRole(e.target.value)}
                                    style={{ display: 'none' }}
                                />
                                <div style={{
                                    padding: '18px 20px',
                                    border: `2px solid ${role === 'STUDENT' ? '#667eea' : 'rgba(102, 126, 234, 0.2)'}`,
                                    borderRadius: '15px',
                                    background: role === 'STUDENT'
                                        ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)'
                                        : 'rgba(255, 255, 255, 0.8)',
                                    backdropFilter: 'blur(10px)',
                                    transition: 'all 0.3s ease',
                                    textAlign: 'center',
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    color: role === 'STUDENT' ? '#667eea' : '#666',
                                    transform: role === 'STUDENT' ? 'translateY(-2px)' : 'translateY(0)',
                                    boxShadow: role === 'STUDENT' ? '0 8px 25px rgba(102, 126, 234, 0.2)' : 'none'
                                }}>
                                    🎓 Student
                                </div>
                            </label>
                            <label style={{
                                flex: 1,
                                position: 'relative',
                                cursor: 'pointer'
                            }}>
                                <input
                                    type="radio"
                                    value="TEACHER"
                                    checked={role === 'TEACHER'}
                                    onChange={(e) => setRole(e.target.value)}
                                    style={{ display: 'none' }}
                                />
                                <div style={{
                                    padding: '18px 20px',
                                    border: `2px solid ${role === 'TEACHER' ? '#43e97b' : 'rgba(67, 233, 123, 0.2)'}`,
                                    borderRadius: '15px',
                                    background: role === 'TEACHER'
                                        ? 'linear-gradient(135deg, rgba(67, 233, 123, 0.1) 0%, rgba(56, 249, 215, 0.1) 100%)'
                                        : 'rgba(255, 255, 255, 0.8)',
                                    backdropFilter: 'blur(10px)',
                                    transition: 'all 0.3s ease',
                                    textAlign: 'center',
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    color: role === 'TEACHER' ? '#43e97b' : '#666',
                                    transform: role === 'TEACHER' ? 'translateY(-2px)' : 'translateY(0)',
                                    boxShadow: role === 'TEACHER' ? '0 8px 25px rgba(67, 233, 123, 0.2)' : 'none'
                                }}>
                                    👨‍🏫 Teacher
                                </div>
                            </label>
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
                                : 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '15px',
                            fontSize: '18px',
                            fontWeight: '700',
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                            transition: 'all 0.3s ease',
                            boxShadow: isLoading
                                ? '0 8px 25px rgba(0, 0, 0, 0.1)'
                                : '0 15px 35px rgba(67, 233, 123, 0.3)',
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            marginBottom: '25px'
                        }}
                        onMouseEnter={(e) => {
                            if (!isLoading) {
                                e.currentTarget.style.transform = 'translateY(-3px)';
                                e.currentTarget.style.boxShadow = '0 20px 45px rgba(67, 233, 123, 0.4)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!isLoading) {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 15px 35px rgba(67, 233, 123, 0.3)';
                            }
                        }}
                    >
                        {isLoading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>

                <div style={{
                    textAlign: 'center',
                    paddingTop: '20px',
                    borderTop: '1px solid rgba(67, 233, 123, 0.1)'
                }}>
                    <p style={{
                        margin: 0,
                        color: '#666',
                        fontSize: '14px',
                        fontWeight: '500'
                    }}>
                        Already have an account?{' '}
                        <Link
                            to="/login"
                            style={{
                                color: '#43e97b',
                                textDecoration: 'none',
                                fontWeight: '700',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.textShadow = '0 0 8px rgba(67, 233, 123, 0.5)'}
                            onMouseLeave={(e) => e.currentTarget.style.textShadow = 'none'}
                        >
                            Sign In
                        </Link>
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

export default Register;
