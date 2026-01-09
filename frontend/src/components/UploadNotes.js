import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const UploadNotes = () => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        subject: '',
        classSemester: '',
        accessType: 'ALL_CLASS',
        assignedStudents: []
    });
    const [file, setFile] = useState(null);
    const [filePreview, setFilePreview] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const navigate = useNavigate();

    // Available options
    const subjects = [
        'Java', 'DBMS', 'OS', 'Data Structures', 'Algorithms',
        'Web Development', 'Machine Learning', 'Computer Networks',
        'Software Engineering', 'Cyber Security', 'Cloud Computing'
    ];

    const classSemesters = [
        'CSE – Semester 3', 'CSE – Semester 4', 'CSE – Semester 5', 'CSE – Semester 6', 'CSE – Semester 7', 'CSE – Semester 8',
        'IT – Semester 3', 'IT – Semester 4', 'IT – Semester 5', 'IT – Semester 6', 'IT – Semester 7', 'IT – Semester 8',
        'ECE – Semester 3', 'ECE – Semester 4', 'ECE – Semester 5', 'ECE – Semester 6', 'ECE – Semester 7', 'ECE – Semester 8'
    ];

    const allowedFileTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp'
    ];

    const fileTypeNames = {
        'application/pdf': 'PDF',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
        'application/msword': 'DOC',
        'application/vnd.ms-powerpoint': 'PPT',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PPTX',
        'image/jpeg': 'JPEG Image',
        'image/png': 'PNG Image',
        'image/gif': 'GIF Image',
        'image/webp': 'WebP Image'
    };

    useEffect(() => {
        // Load students for selection
        fetchStudents();
    }, []);

    useEffect(() => {
        // Filter students based on selected class/semester
        if (formData.classSemester) {
            const filtered = students.filter(student => student.classSemester === formData.classSemester);
            setFilteredStudents(filtered);
        } else {
            setFilteredStudents([]);
        }
    }, [formData.classSemester, students]);

    const fetchStudents = async () => {
        try {
            // This would need a new endpoint to get all students
            // For now, we'll use a mock approach
            setStudents([
                { id: 2, username: 'student1', classSemester: 'CSE – Semester 5' },
                { id: 3, username: 'student2', classSemester: 'CSE – Semester 5' },
                { id: 4, username: 'student3', classSemester: 'IT – Semester 6' },
                { id: 5, username: 'student4', classSemester: 'IT – Semester 6' },
                { id: 6, username: 'student5', classSemester: 'CSE – Semester 5' },
                { id: 7, username: 'student6', classSemester: 'IT – Semester 6' }
            ]);
        } catch (error) {
            console.error('Error fetching students:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            // Validate file type
            if (!allowedFileTypes.includes(selectedFile.type)) {
                setError('Invalid file type. Allowed: PDF, DOCX, PPT, Images');
                setFile(null);
                setFilePreview(null);
                return;
            }

            setFile(selectedFile);
            setError('');

            // Create preview for images
            if (selectedFile.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => setFilePreview(e.target.result);
                reader.readAsDataURL(selectedFile);
            } else {
                setFilePreview(null);
            }
        }
    };

    const handleStudentSelection = (studentId) => {
        setFormData(prev => ({
            ...prev,
            assignedStudents: prev.assignedStudents.includes(studentId)
                ? prev.assignedStudents.filter(id => id !== studentId)
                : [...prev.assignedStudents, studentId]
        }));
    };

    const handleSelectAllStudents = () => {
        const allStudentIds = filteredStudents.map(student => student.id);
        setFormData(prev => ({
            ...prev,
            assignedStudents: prev.assignedStudents.length === filteredStudents.length ? [] : allStudentIds
        }));
    };

    const handleUpload = async () => {
        if (!file) {
            setError('Please select a file');
            return;
        }
        if (!formData.title.trim()) {
            setError('Please enter a title');
            return;
        }
        if (!formData.subject) {
            setError('Please select a subject');
            return;
        }
        if (!formData.classSemester) {
            setError('Please select a class/semester');
            return;
        }
        if (formData.accessType === 'SELECTED_STUDENTS' && formData.assignedStudents.length === 0) {
            setError('Please select at least one student');
            return;
        }

        setIsLoading(true);
        setError('');
        setSuccess('');

        try {
            const uploadData = new FormData();
            uploadData.append('file', file);
            uploadData.append('title', formData.title);
            uploadData.append('description', formData.description);
            uploadData.append('subject', formData.subject);
            uploadData.append('classSemester', formData.classSemester);
            uploadData.append('accessType', formData.accessType);
            uploadData.append('assignedStudents', JSON.stringify(formData.assignedStudents));

            await axios.post('http://localhost:8080/api/notes', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setSuccess('Note uploaded successfully! Students will be notified.');

            // Reset form after successful upload
            setTimeout(() => {
                setFormData({
                    title: '',
                    description: '',
                    subject: '',
                    classSemester: '',
                    accessType: 'ALL_CLASS',
                    assignedStudents: []
                });
                setFile(null);
                setFilePreview(null);
                navigate('/teacher');
            }, 2000);

        } catch (error) {
            setError('Upload failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '40px',
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        }}>
            <div style={{
                maxWidth: '900px',
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
                        Upload Study Material
                    </h1>
                    <p style={{
                        margin: 0,
                        color: '#666',
                        fontSize: '16px',
                        fontWeight: '500'
                    }}>
                        Share knowledge and help students excel in their studies
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

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '40px' }}>
                    {/* Left Column - Form */}
                    <div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                            {/* Title */}
                            <div>
                            <label style={{
                                display: 'block',
                                marginBottom: '8px',
                                color: '#2c3e50',
                                fontSize: '16px',
                                fontWeight: '600'
                            }}>
                                Note Title *
                            </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    placeholder="e.g., Chapter 5 - Inheritance"
                                    style={{
                                        width: '100%',
                                        padding: '15px',
                                        border: '2px solid rgba(102, 126, 234, 0.2)',
                                        borderRadius: '12px',
                                        fontSize: '16px',
                                        background: 'rgba(255, 255, 255, 0.8)',
                                        transition: 'all 0.3s ease',
                                        outline: 'none'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#667eea'}
                                    onBlur={(e) => e.target.style.borderColor = 'rgba(102, 126, 234, 0.2)'}
                                />
                            </div>

                            {/* Subject */}
                            <div>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '8px',
                                    color: '#2c3e50',
                                    fontSize: '16px',
                                    fontWeight: '600'
                                }}>
                                    Subject *
                                </label>
                                <select
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleInputChange}
                                    style={{
                                        width: '100%',
                                        padding: '15px',
                                        border: '2px solid rgba(102, 126, 234, 0.2)',
                                        borderRadius: '12px',
                                        fontSize: '16px',
                                        background: 'rgba(255, 255, 255, 0.8)',
                                        transition: 'all 0.3s ease',
                                        outline: 'none'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#667eea'}
                                    onBlur={(e) => e.target.style.borderColor = 'rgba(102, 126, 234, 0.2)'}
                                >
                                    <option value="">Select Subject</option>
                                    {subjects.map(subject => (
                                        <option key={subject} value={subject}>{subject}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Description */}
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '8px',
                                color: '#2c3e50',
                                fontSize: '16px',
                                fontWeight: '600'
                            }}>
                                Description/Topic
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder="Brief description of the note content..."
                                rows="3"
                                style={{
                                    width: '100%',
                                    padding: '15px',
                                    border: '2px solid rgba(102, 126, 234, 0.2)',
                                    borderRadius: '12px',
                                    fontSize: '16px',
                                    background: 'rgba(255, 255, 255, 0.8)',
                                    resize: 'vertical',
                                    transition: 'all 0.3s ease',
                                    outline: 'none'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                                onBlur={(e) => e.target.style.borderColor = 'rgba(102, 126, 234, 0.2)'}
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                            {/* Class/Semester */}
                            <div>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '8px',
                                    color: '#2c3e50',
                                    fontSize: '16px',
                                    fontWeight: '600'
                                }}>
                                    Class/Semester *
                                </label>
                                <select
                                    name="classSemester"
                                    value={formData.classSemester}
                                    onChange={handleInputChange}
                                    style={{
                                        width: '100%',
                                        padding: '15px',
                                        border: '2px solid rgba(102, 126, 234, 0.2)',
                                        borderRadius: '12px',
                                        fontSize: '16px',
                                        background: 'rgba(255, 255, 255, 0.8)',
                                        transition: 'all 0.3s ease',
                                        outline: 'none'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#667eea'}
                                    onBlur={(e) => e.target.style.borderColor = 'rgba(102, 126, 234, 0.2)'}
                                >
                                    <option value="">Select Class/Semester</option>
                                    {classSemesters.map(semester => (
                                        <option key={semester} value={semester}>{semester}</option>
                                    ))}
                                </select>
                            </div>

                            {/* File Upload */}
                            <div>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '8px',
                                    color: '#2c3e50',
                                    fontSize: '16px',
                                    fontWeight: '600'
                                }}>
                                    File Upload *
                                </label>
                                <input
                                    type="file"
                                    accept=".pdf,.docx,.doc,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.webp"
                                    onChange={handleFileChange}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        border: '2px solid rgba(102, 126, 234, 0.2)',
                                        borderRadius: '12px',
                                        background: 'rgba(255, 255, 255, 0.8)',
                                        fontSize: '14px'
                                    }}
                                />
                                {file && (
                                    <div style={{
                                        marginTop: '8px',
                                        fontSize: '12px',
                                        color: '#28a745',
                                        fontWeight: '500'
                                    }}>
                                        {fileTypeNames[file.type] || 'File'} selected
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Access Control */}
                        <div style={{ marginBottom: '30px' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '12px',
                                color: '#2c3e50',
                                fontSize: '18px',
                                fontWeight: '700'
                            }}>
                                Access Control
                            </label>

                            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                    <input
                                        type="radio"
                                        name="accessType"
                                        value="ALL_CLASS"
                                        checked={formData.accessType === 'ALL_CLASS'}
                                        onChange={handleInputChange}
                                        style={{ marginRight: '8px' }}
                                    />
                                    <span style={{ fontWeight: '500' }}>All students in class</span>
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                    <input
                                        type="radio"
                                        name="accessType"
                                        value="SELECTED_STUDENTS"
                                        checked={formData.accessType === 'SELECTED_STUDENTS'}
                                        onChange={handleInputChange}
                                        style={{ marginRight: '8px' }}
                                    />
                                    <span style={{ fontWeight: '500' }}>Only selected students</span>
                                </label>
                            </div>

                            {/* Student Selection */}
                            {formData.accessType === 'SELECTED_STUDENTS' && formData.classSemester && (
                                <div style={{
                                    border: '2px solid rgba(67, 233, 123, 0.3)',
                                    borderRadius: '12px',
                                    padding: '20px',
                                    background: 'rgba(67, 233, 123, 0.05)'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                        <h4 style={{ margin: 0, color: '#2c3e50' }}>Select Students ({filteredStudents.length})</h4>
                                        <button
                                            onClick={handleSelectAllStudents}
                                            style={{
                                                background: formData.assignedStudents.length === filteredStudents.length ? '#28a745' : '#667eea',
                                                color: 'white',
                                                border: 'none',
                                                padding: '8px 16px',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                fontSize: '14px',
                                                fontWeight: '600'
                                            }}
                                        >
                                            {formData.assignedStudents.length === filteredStudents.length ? 'Deselect All' : 'Select All'}
                                        </button>
                                    </div>

                                    <div style={{
                                        maxHeight: '200px',
                                        overflowY: 'auto',
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                                        gap: '10px'
                                    }}>
                                        {filteredStudents.map(student => (
                                            <label
                                                key={student.id}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    padding: '8px 12px',
                                                    border: `2px solid ${formData.assignedStudents.includes(student.id) ? '#28a745' : 'rgba(102, 126, 234, 0.2)'}`,
                                                    borderRadius: '8px',
                                                    background: formData.assignedStudents.includes(student.id) ? 'rgba(40, 167, 69, 0.1)' : 'rgba(255, 255, 255, 0.8)',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.3s ease',
                                                    fontSize: '14px'
                                                }}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={formData.assignedStudents.includes(student.id)}
                                                    onChange={() => handleStudentSelection(student.id)}
                                                    style={{ marginRight: '8px' }}
                                                />
                                                {student.username}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', gap: '15px' }}>
                            <button
                                onClick={handleUpload}
                                disabled={isLoading}
                                style={{
                                    flex: 1,
                                    padding: '16px',
                                    background: isLoading
                                        ? 'linear-gradient(135deg, #ccc 0%, #999 100%)'
                                        : 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '12px',
                                    fontSize: '16px',
                                    fontWeight: '700',
                                    cursor: isLoading ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.3s ease',
                                    boxShadow: isLoading
                                        ? '0 8px 25px rgba(0, 0, 0, 0.1)'
                                        : '0 12px 35px rgba(67, 233, 123, 0.3)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px'
                                }}
                            >
                                {isLoading ? 'Uploading...' : 'Upload Note'}
                            </button>
                            <button
                                onClick={() => navigate('/teacher')}
                                style={{
                                    padding: '16px 24px',
                                    background: 'rgba(108, 117, 125, 0.9)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '12px',
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                ← Back
                            </button>
                        </div>
                    </div>

                    {/* Right Column - Preview */}
                    <div>
                        <div style={{
                            background: 'rgba(255, 255, 255, 0.9)',
                            borderRadius: '15px',
                            padding: '25px',
                            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
                            border: '2px solid rgba(102, 126, 234, 0.1)',
                            position: 'sticky',
                            top: '20px'
                        }}>
                            <h3 style={{
                                margin: '0 0 20px 0',
                                color: '#2c3e50',
                                fontSize: '20px',
                                fontWeight: '700',
                                textAlign: 'center'
                            }}>
                                Preview & Analytics
                            </h3>

                            {filePreview ? (
                                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                                    <img
                                        src={filePreview}
                                        alt="File Preview"
                                        style={{
                                            maxWidth: '100%',
                                            maxHeight: '200px',
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
                                        }}
                                    />
                                </div>
                            ) : file ? (
                                <div style={{
                                    textAlign: 'center',
                                    marginBottom: '20px',
                                    padding: '40px',
                                    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                                    borderRadius: '12px',
                                    border: '2px dashed rgba(102, 126, 234, 0.3)'
                                }}>
                                    <div style={{ fontSize: '48px', marginBottom: '10px', color: '#667eea', fontWeight: 'bold' }}>F</div>
                                    <div style={{ fontSize: '16px', color: '#666', fontWeight: '500' }}>
                                        {file.name}
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#999', marginTop: '5px' }}>
                                        {(file.size / 1024 / 1024).toFixed(2)} MB
                                    </div>
                                </div>
                            ) : (
                                <div style={{
                                    textAlign: 'center',
                                    marginBottom: '20px',
                                    padding: '40px',
                                    background: 'rgba(200, 200, 200, 0.1)',
                                    borderRadius: '12px',
                                    border: '2px dashed rgba(200, 200, 200, 0.5)'
                                }}>
                                    <div style={{ fontSize: '48px', marginBottom: '10px', color: '#ccc', fontWeight: 'bold' }}>F</div>
                                    <div style={{ fontSize: '14px', color: '#999' }}>
                                        Select a file to see preview
                                    </div>
                                </div>
                            )}

                            {/* Analytics Preview */}
                            <div style={{
                                background: 'linear-gradient(135deg, rgba(67, 233, 123, 0.1) 0%, rgba(56, 249, 215, 0.1) 100%)',
                                borderRadius: '12px',
                                padding: '20px',
                                border: '1px solid rgba(67, 233, 123, 0.2)'
                            }}>
                                <h4 style={{ margin: '0 0 15px 0', color: '#2c3e50', fontSize: '16px' }}>
                                    Expected Analytics
                                </h4>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                    <span style={{ fontSize: '14px', color: '#666' }}>Downloads:</span>
                                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#28a745' }}>0</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                    <span style={{ fontSize: '14px', color: '#666' }}>Students:</span>
                                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#667eea' }}>
                                        {formData.accessType === 'ALL_CLASS' ? filteredStudents.length : formData.assignedStudents.length}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ fontSize: '14px', color: '#666' }}>Subject:</span>
                                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#9c27b0' }}>
                                        {formData.subject || 'Not selected'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UploadNotes;
