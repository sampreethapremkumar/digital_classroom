import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [pendingUsers, setPendingUsers] = useState([]);
    const [statistics, setStatistics] = useState({});
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const navigate = useNavigate();

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        try {
            setLoading(true);
            const [usersRes, pendingRes, statsRes] = await Promise.all([
                axios.get('/api/admin/users'),
                axios.get('/api/admin/users/pending'),
                axios.get('/api/admin/statistics')
            ]);

            setUsers(usersRes.data);
            setPendingUsers(pendingRes.data);
            setStatistics(statsRes.data);
        } catch (error) {
            console.error('Error fetching admin data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApproveUser = async (userId) => {
        try {
            await axios.post(`/api/admin/users/${userId}/approve`);
            fetchAllData(); // Refresh data
        } catch (error) {
            console.error('Error approving user:', error);
        }
    };

    const handleRejectUser = async (userId) => {
        try {
            await axios.post(`/api/admin/users/${userId}/reject`);
            fetchAllData(); // Refresh data
        } catch (error) {
            console.error('Error rejecting user:', error);
        }
    };

    const handleChangeRole = async (userId, newRole) => {
        try {
            await axios.put(`/api/admin/users/${userId}/role`, { role: newRole });
            fetchAllData(); // Refresh data
        } catch (error) {
            console.error('Error changing user role:', error);
        }
    };

    const handleActivateUser = async (userId) => {
        try {
            await axios.post(`/api/admin/users/${userId}/activate`);
            fetchAllData(); // Refresh data
        } catch (error) {
            console.error('Error activating user:', error);
        }
    };

    const handleDeactivateUser = async (userId) => {
        try {
            await axios.post(`/api/admin/users/${userId}/deactivate`);
            fetchAllData(); // Refresh data
        } catch (error) {
            console.error('Error deactivating user:', error);
        }
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            'APPROVED': { color: '#43e97b', text: 'Approved' },
            'PENDING': { color: '#ffc107', text: 'Pending' },
            'REJECTED': { color: '#dc3545', text: 'Rejected' }
        };
        const config = statusConfig[status] || { color: '#6c757d', text: status };
        return (
            <span style={{
                backgroundColor: config.color,
                color: 'white',
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: '600'
            }}>
                {config.text}
            </span>
        );
    };

    const getRoleBadge = (role) => {
        const roleConfig = {
            'SUPER_ADMIN': { color: '#e91e63', text: 'Admin' },
            'TEACHER': { color: '#2196f3', text: 'Teacher' },
            'STUDENT': { color: '#4caf50', text: 'Student' }
        };
        const config = roleConfig[role] || { color: '#6c757d', text: role };
        return (
            <span style={{
                backgroundColor: config.color,
                color: 'white',
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: '600'
            }}>
                {config.text}
            </span>
        );
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <h2>Loading Admin Dashboard...</h2>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        }}>
            {/* Header */}
            <div style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                padding: '20px',
                borderBottom: '1px solid rgba(102, 126, 234, 0.2)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1400px', margin: '0 auto' }}>
                    <div>
                        <h1 style={{
                            margin: '0 0 5px 0',
                            fontSize: '28px',
                            fontWeight: '800',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text'
                        }}>
                            👑 Admin Dashboard
                        </h1>
                        <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                            Manage users, approvals, and system settings
                        </p>
                    </div>
                    <button
                        onClick={() => {
                            localStorage.clear();
                            navigate('/login');
                        }}
                        style={{
                            background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
                            color: 'white',
                            border: 'none',
                            padding: '10px 20px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '600'
                        }}
                    >
                        Logout
                    </button>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                borderBottom: '1px solid rgba(102, 126, 234, 0.2)',
                position: 'sticky',
                top: 0,
                zIndex: 100
            }}>
                <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                    <div style={{ display: 'flex', gap: '0' }}>
                        {[
                            { id: 'overview', label: '📊 Overview', count: null },
                            { id: 'pending', label: '⏳ Pending Approvals', count: pendingUsers.length },
                            { id: 'users', label: '👥 All Users', count: users.length }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                style={{
                                    padding: '15px 25px',
                                    background: activeTab === tab.id ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent',
                                    color: activeTab === tab.id ? 'white' : '#666',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    borderBottom: activeTab === tab.id ? '3px solid #667eea' : '3px solid transparent',
                                    position: 'relative'
                                }}
                            >
                                {tab.label}
                                {tab.count !== null && tab.count > 0 && (
                                    <span style={{
                                        background: '#ff4444',
                                        color: 'white',
                                        borderRadius: '10px',
                                        padding: '2px 6px',
                                        fontSize: '11px',
                                        fontWeight: '700',
                                        marginLeft: '8px'
                                    }}>
                                        {tab.count}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '30px' }}>

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div>
                        <h2 style={{ marginBottom: '30px', color: '#2c3e50' }}>📊 System Overview</h2>

                        {/* Statistics Cards */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                            <div style={{
                                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                                borderRadius: '15px',
                                padding: '25px',
                                border: '1px solid rgba(102, 126, 234, 0.2)'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                                    <span style={{ fontSize: '32px', marginRight: '15px' }}>👨‍🏫</span>
                                    <div>
                                        <h3 style={{ margin: '0 0 5px 0', fontSize: '32px', fontWeight: '900', color: '#1a1a1a' }}>
                                            {statistics.totalTeachers || 0}
                                        </h3>
                                        <p style={{ margin: 0, color: '#2c3e50', fontSize: '14px', fontWeight: '600' }}>Total Teachers</p>
                                    </div>
                                </div>
                            </div>

                            <div style={{
                                background: 'linear-gradient(135deg, rgba(67, 233, 123, 0.1) 0%, rgba(56, 249, 215, 0.1) 100%)',
                                borderRadius: '15px',
                                padding: '25px',
                                border: '1px solid rgba(67, 233, 123, 0.2)'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                                    <span style={{ fontSize: '32px', marginRight: '15px' }}>👩‍🎓</span>
                                    <div>
                                        <h3 style={{ margin: '0 0 5px 0', fontSize: '32px', fontWeight: '900', color: '#1a1a1a' }}>
                                            {statistics.totalStudents || 0}
                                        </h3>
                                        <p style={{ margin: 0, color: '#2c3e50', fontSize: '14px', fontWeight: '600' }}>Total Students</p>
                                    </div>
                                </div>
                            </div>

                            <div style={{
                                background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 87, 34, 0.1) 100%)',
                                borderRadius: '15px',
                                padding: '25px',
                                border: '1px solid rgba(255, 193, 7, 0.2)'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                                    <span style={{ fontSize: '32px', marginRight: '15px' }}>✅</span>
                                    <div>
                                        <h3 style={{ margin: '0 0 5px 0', fontSize: '32px', fontWeight: '900', color: '#1a1a1a' }}>
                                            {statistics.activeUsers || 0}
                                        </h3>
                                        <p style={{ margin: 0, color: '#2c3e50', fontSize: '14px', fontWeight: '600' }}>Active Users</p>
                                    </div>
                                </div>
                            </div>

                            <div style={{
                                background: 'linear-gradient(135deg, rgba(220, 53, 69, 0.1) 0%, rgba(200, 35, 51, 0.1) 100%)',
                                borderRadius: '15px',
                                padding: '25px',
                                border: '1px solid rgba(220, 53, 69, 0.2)'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                                    <span style={{ fontSize: '32px', marginRight: '15px' }}>⏳</span>
                                    <div>
                                        <h3 style={{ margin: '0 0 5px 0', fontSize: '32px', fontWeight: '900', color: '#1a1a1a' }}>
                                            {statistics.pendingApprovals || 0}
                                        </h3>
                                        <p style={{ margin: 0, color: '#2c3e50', fontSize: '14px', fontWeight: '600' }}>Pending Approvals</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div style={{
                            background: 'rgba(255, 255, 255, 0.95)',
                            borderRadius: '15px',
                            padding: '25px',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255, 255, 255, 0.2)'
                        }}>
                            <h3 style={{ margin: '0 0 20px 0', color: '#2c3e50', fontSize: '20px' }}>📈 System Statistics</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '32px', fontWeight: '800', color: '#667eea' }}>
                                        {statistics.totalQuizzes || 0}
                                    </div>
                                    <div style={{ color: '#666', fontSize: '14px' }}>Total Quizzes</div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '32px', fontWeight: '800', color: '#43e97b' }}>
                                        {statistics.totalAssignments || 0}
                                    </div>
                                    <div style={{ color: '#666', fontSize: '14px' }}>Total Assignments</div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '32px', fontWeight: '800', color: '#ffc107' }}>
                                        {statistics.totalSubmissions || 0}
                                    </div>
                                    <div style={{ color: '#666', fontSize: '14px' }}>Total Submissions</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Pending Approvals Tab */}
                {activeTab === 'pending' && (
                    <div>
                        <h2 style={{ marginBottom: '30px', color: '#2c3e50' }}>⏳ Pending User Approvals</h2>

                        {pendingUsers.length === 0 ? (
                            <div style={{
                                background: 'rgba(255, 255, 255, 0.95)',
                                borderRadius: '15px',
                                padding: '50px',
                                textAlign: 'center',
                                backdropFilter: 'blur(20px)',
                                border: '1px solid rgba(255, 255, 255, 0.2)'
                            }}>
                                <span style={{ fontSize: '48px', marginBottom: '20px', display: 'block' }}>✅</span>
                                <h3 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>No Pending Approvals</h3>
                                <p style={{ margin: 0, color: '#666' }}>All user registrations have been processed.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gap: '15px' }}>
                                {pendingUsers.map(user => (
                                    <div key={user.id} style={{
                                        background: 'rgba(255, 255, 255, 0.95)',
                                        borderRadius: '15px',
                                        padding: '25px',
                                        backdropFilter: 'blur(20px)',
                                        border: '1px solid rgba(255, 193, 7, 0.3)',
                                        borderLeft: '5px solid #ffc107'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
                                                    <h3 style={{ margin: 0, color: '#2c3e50' }}>{user.username}</h3>
                                                    {getRoleBadge(user.role)}
                                                    {getStatusBadge(user.status)}
                                                </div>
                                                <p style={{ margin: '5px 0', color: '#666', fontSize: '14px' }}>
                                                    <strong>Email:</strong> {user.email}
                                                </p>
                                                {user.classSemester && (
                                                    <p style={{ margin: '5px 0', color: '#666', fontSize: '14px' }}>
                                                        <strong>Class:</strong> {user.classSemester}
                                                    </p>
                                                )}
                                                <p style={{ margin: '5px 0', color: '#666', fontSize: '12px' }}>
                                                    <strong>Registered:</strong> {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                                                </p>
                                            </div>

                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                <button
                                                    onClick={() => handleApproveUser(user.id)}
                                                    style={{
                                                        background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                                                        color: 'white',
                                                        border: 'none',
                                                        padding: '10px 20px',
                                                        borderRadius: '8px',
                                                        cursor: 'pointer',
                                                        fontSize: '14px',
                                                        fontWeight: '600'
                                                    }}
                                                >
                                                    ✅ Approve
                                                </button>
                                                <button
                                                    onClick={() => handleRejectUser(user.id)}
                                                    style={{
                                                        background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
                                                        color: 'white',
                                                        border: 'none',
                                                        padding: '10px 20px',
                                                        borderRadius: '8px',
                                                        cursor: 'pointer',
                                                        fontSize: '14px',
                                                        fontWeight: '600'
                                                    }}
                                                >
                                                    ❌ Reject
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* All Users Tab */}
                {activeTab === 'users' && (
                    <div>
                        <h2 style={{ marginBottom: '30px', color: '#2c3e50' }}>👥 All Users Management</h2>

                        <div style={{ display: 'grid', gap: '15px' }}>
                            {users.map(user => (
                                <div key={user.id} style={{
                                    background: 'rgba(255, 255, 255, 0.95)',
                                    borderRadius: '15px',
                                    padding: '25px',
                                    backdropFilter: 'blur(20px)',
                                    border: '1px solid rgba(255, 255, 255, 0.2)'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
                                                <h3 style={{ margin: 0, color: '#2c3e50' }}>{user.username}</h3>
                                                {getRoleBadge(user.role)}
                                                {getStatusBadge(user.status)}
                                            </div>
                                            <p style={{ margin: '5px 0', color: '#666', fontSize: '14px' }}>
                                                <strong>Email:</strong> {user.email}
                                            </p>
                                            {user.classSemester && (
                                                <p style={{ margin: '5px 0', color: '#666', fontSize: '14px' }}>
                                                    <strong>Class:</strong> {user.classSemester}
                                                </p>
                                            )}
                                            <p style={{ margin: '5px 0', color: '#666', fontSize: '12px' }}>
                                                <strong>Created:</strong> {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                                                {user.approvedAt && (
                                                    <span style={{ marginLeft: '15px' }}>
                                                        <strong>Approved:</strong> {new Date(user.approvedAt).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </p>
                                        </div>

                                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                            {/* Role Change */}
                                            <select
                                                value={user.role}
                                                onChange={(e) => handleChangeRole(user.id, e.target.value)}
                                                style={{
                                                    padding: '8px 12px',
                                                    border: '2px solid rgba(102, 126, 234, 0.2)',
                                                    borderRadius: '6px',
                                                    fontSize: '14px',
                                                    background: 'rgba(255, 255, 255, 0.8)'
                                                }}
                                            >
                                                <option value="SUPER_ADMIN">Admin</option>
                                                <option value="TEACHER">Teacher</option>
                                                <option value="STUDENT">Student</option>
                                            </select>

                                            {/* Status Actions */}
                                            {user.status === 'APPROVED' ? (
                                                <button
                                                    onClick={() => handleDeactivateUser(user.id)}
                                                    style={{
                                                        background: 'linear-gradient(135deg, #ffc107 0%, #ff8f00 100%)',
                                                        color: 'white',
                                                        border: 'none',
                                                        padding: '8px 16px',
                                                        borderRadius: '6px',
                                                        cursor: 'pointer',
                                                        fontSize: '14px',
                                                        fontWeight: '600'
                                                    }}
                                                >
                                                    Deactivate
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleActivateUser(user.id)}
                                                    style={{
                                                        background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                                                        color: 'white',
                                                        border: 'none',
                                                        padding: '8px 16px',
                                                        borderRadius: '6px',
                                                        cursor: 'pointer',
                                                        fontSize: '14px',
                                                        fontWeight: '600'
                                                    }}
                                                >
                                                    Activate
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
