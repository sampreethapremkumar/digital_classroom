import React, { useState, useEffect } from 'react';
import axios from '../api';
import { useNavigate } from 'react-router-dom';

const CreateAssignment = () => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        subject: '',
        classSemester: '',
        accessType: 'ALL_CLASS',
        assignedStudents: [],
        instructions: '',
        submissionType: 'FILE',
        maxFileSize: 10,
        allowedFileTypes: 'pdf,docx,zip',
        dueDate: '',
        dueTime: '',
        lateSubmissionPolicy: 'ALLOW',
        totalMarks: '',
        rubricId: ''
    });
    const [file, setFile] = useState(null);
    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [rubrics, setRubrics] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
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

    const submissionTypes = [
        { value: 'FILE', label: 'File Upload Only' },
        { value: 'TEXT', label: 'Text Submission Only' },
        { value: 'BOTH', label: 'File and Text Submission' }
    ];

    const lateSubmissionPolicies = [
        { value: 'ALLOW', label: 'Allow Late Submission' },
        { value: 'DISALLOW', label: 'Disallow After Due Date' },
        { value: 'PENALTY', label: 'Allow with Penalty (Future)' }
    ];

    useEffect(() => {
        fetchStudents();
        fetchRubrics();
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
            // Mock data for now
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

    const fetchRubrics = async () => {
        try {
            const response = await axios.get('/api/teacher/rubrics');
            setRubrics(response.data);
        } catch (error) {
            console.error('Error fetching rubrics:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? (value ? parseInt(value) : '') : value
        }));
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            // Validate file type for question paper
            const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
            if (!allowedTypes.includes(selectedFile.type)) {
                setError('Question paper must be PDF or DOCX format');
                setFile(null);
                return;
            }
            setFile(selectedFile);
            setError('');
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

    const handleCreate = async () => {
        // Validation
        if (!formData.title.trim()) {
            setError('Please enter assignment title');
            return;
        }
        if (!formData.subject) {
            setError('Please select a subject');
            return;
        }
        if (!formData.classSemester) {
            setError('Please select class/semester');
            return;
        }
        if (formData.accessType === 'SELECTED_STUDENTS' && formData.assignedStudents.length === 0) {
            setError('Please select at least one student');
            return;
        }
        if (!formData.dueDate || !formData.dueTime) {
            setError('Please set due date and time');
            return;
        }
        if (!formData.totalMarks || formData.totalMarks <= 0) {
            setError('Please enter valid total marks');
            return;
        }

        setIsLoading(true);
        setError('');
        setSuccess('');

        try {
            // Combine date and time
            const dueDateTime = `${formData.dueDate}T${formData.dueTime}`;

            const assignmentData = new FormData();
            assignmentData.append('title', formData.title);
            assignmentData.append('description', formData.description);
            assignmentData.append('subject', formData.subject);
            assignmentData.append('classSemester', formData.classSemester);
            assignmentData.append('accessType', formData.accessType);
            assignmentData.append('assignedStudents', JSON.stringify(formData.assignedStudents));
            assignmentData.append('instructions', formData.instructions);
            assignmentData.append('submissionType', formData.submissionType);
            assignmentData.append('maxFileSize', formData.maxFileSize.toString());
            assignmentData.append('allowedFileTypes', formData.allowedFileTypes);
            assignmentData.append('dueDate', dueDateTime);
            assignmentData.append('lateSubmissionPolicy', formData.lateSubmissionPolicy);
            assignmentData.append('totalMarks', formData.totalMarks.toString());

            if (formData.rubricId) {
                assignmentData.append('rubricId', formData.rubricId.toString());
            }

            if (file) {
                assignmentData.append('file', file);
            }

            await axios.post('/api/assignments', assignmentData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setSuccess('Assignment created successfully! Students will be notified.');

            // Reset form after successful creation
            setTimeout(() => {
                setFormData({
                    title: '',
                    description: '',
                    subject: '',
                    classSemester: '',
                    accessType: 'ALL_CLASS',
                    assignedStudents: [],
                    instructions: '',
                    submissionType: 'FILE',
                    maxFileSize: 10,
                    allowedFileTypes: 'pdf,docx,zip',
                    dueDate: '',
                    dueTime: '',
                    lateSubmissionPolicy: 'ALLOW',
                    totalMarks: ''
                });
                setFile(null);
                navigate('/teacher');
            }, 2000);

        } catch (error) {
            setError('Failed to create assignment. Please try again.');
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
                maxWidth: '1000px',
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
                        Create Assignment
                    </h1>
                    <p style={{
                        margin: 0,
                        color: '#666',
                        fontSize: '16px',
                        fontWeight: '500'
                    }}>
                        Design comprehensive assignments with targeted delivery
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

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '40px' }}>
                    {/* Left Column - Form */}
                    <div>
                        {/* Academic Targeting */}
                        <div style={{ marginBottom: '30px' }}>
                            <h2 style={{
                                margin: '0 0 20px 0',
                                color: '#2c3e50',
                                fontSize: '22px',
                                fontWeight: '700',
                                borderBottom: '3px solid #667eea',
                                paddingBottom: '10px'
                            }}>
                                Academic Targeting
                            </h2>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
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
                                    >
                                        <option value="">Select Subject</option>
                                        {subjects.map(subject => (
                                            <option key={subject} value={subject}>{subject}</option>
                                        ))}
                                    </select>
                                </div>

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
                                    >
                                        <option value="">Select Class/Semester</option>
                                        {classSemesters.map(semester => (
                                            <option key={semester} value={semester}>{semester}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Student Selection */}
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '12px',
                                    color: '#2c3e50',
                                    fontSize: '18px',
                                    fontWeight: '700'
                                }}>
                                    Student Selection
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
                        </div>

                        {/* Assignment Content */}
                        <div style={{ marginBottom: '30px' }}>
                            <h2 style={{
                                margin: '0 0 20px 0',
                                color: '#2c3e50',
                                fontSize: '22px',
                                fontWeight: '700',
                                borderBottom: '3px solid #f093fb',
                                paddingBottom: '10px'
                            }}>
                                Assignment Content
                            </h2>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '8px',
                                    color: '#2c3e50',
                                    fontSize: '16px',
                                    fontWeight: '600'
                                }}>
                                    Assignment Title *
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    placeholder="e.g., Database Design Project"
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
                                />
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '8px',
                                    color: '#2c3e50',
                                    fontSize: '16px',
                                    fontWeight: '600'
                                }}>
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Brief overview of the assignment..."
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
                                />
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '8px',
                                    color: '#2c3e50',
                                    fontSize: '16px',
                                    fontWeight: '600'
                                }}>
                                    Detailed Instructions/Guidelines
                                </label>
                                <textarea
                                    name="instructions"
                                    value={formData.instructions}
                                    onChange={handleInputChange}
                                    placeholder="Provide detailed submission guidelines, format requirements, evaluation criteria..."
                                    rows="5"
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
                                />
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '8px',
                                    color: '#2c3e50',
                                    fontSize: '16px',
                                    fontWeight: '600'
                                }}>
                                    Question Paper/Attachment (Optional)
                                </label>
                                <input
                                    type="file"
                                    accept=".pdf,.docx"
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
                                        File selected: {file.name}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Submission Control */}
                        <div style={{ marginBottom: '30px' }}>
                            <h2 style={{
                                margin: '0 0 20px 0',
                                color: '#2c3e50',
                                fontSize: '22px',
                                fontWeight: '700',
                                borderBottom: '3px solid #4facfe',
                                paddingBottom: '10px'
                            }}>
                                Submission Control
                            </h2>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                                <div>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '8px',
                                        color: '#2c3e50',
                                        fontSize: '16px',
                                        fontWeight: '600'
                                    }}>
                                        Submission Type
                                    </label>
                                    <select
                                        name="submissionType"
                                        value={formData.submissionType}
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
                                    >
                                        {submissionTypes.map(type => (
                                            <option key={type.value} value={type.value}>{type.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '8px',
                                        color: '#2c3e50',
                                        fontSize: '16px',
                                        fontWeight: '600'
                                    }}>
                                        Max File Size (MB)
                                    </label>
                                    <input
                                        type="number"
                                        name="maxFileSize"
                                        value={formData.maxFileSize}
                                        onChange={handleInputChange}
                                        min="1"
                                        max="100"
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
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '8px',
                                    color: '#2c3e50',
                                    fontSize: '16px',
                                    fontWeight: '600'
                                }}>
                                    Allowed File Types
                                </label>
                                <input
                                    type="text"
                                    name="allowedFileTypes"
                                    value={formData.allowedFileTypes}
                                    onChange={handleInputChange}
                                    placeholder="e.g., pdf,docx,zip"
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
                                />
                            </div>
                        </div>

                        {/* Deadline & Evaluation */}
                        <div style={{ marginBottom: '30px' }}>
                            <h2 style={{
                                margin: '0 0 20px 0',
                                color: '#2c3e50',
                                fontSize: '22px',
                                fontWeight: '700',
                                borderBottom: '3px solid #43e97b',
                                paddingBottom: '10px'
                            }}>
                                Deadline & Evaluation
                            </h2>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                                <div>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '8px',
                                        color: '#2c3e50',
                                        fontSize: '16px',
                                        fontWeight: '600'
                                    }}>
                                        Due Date *
                                    </label>
                                    <input
                                        type="date"
                                        name="dueDate"
                                        value={formData.dueDate}
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
                                    />
                                </div>

                                <div>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '8px',
                                        color: '#2c3e50',
                                        fontSize: '16px',
                                        fontWeight: '600'
                                    }}>
                                        Due Time *
                                    </label>
                                    <input
                                        type="time"
                                        name="dueTime"
                                        value={formData.dueTime}
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
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                                <div>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '8px',
                                        color: '#2c3e50',
                                        fontSize: '16px',
                                        fontWeight: '600'
                                    }}>
                                        Late Submission Policy
                                    </label>
                                    <select
                                        name="lateSubmissionPolicy"
                                        value={formData.lateSubmissionPolicy}
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
                                    >
                                        {lateSubmissionPolicies.map(policy => (
                                            <option key={policy.value} value={policy.value}>{policy.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '8px',
                                        color: '#2c3e50',
                                        fontSize: '16px',
                                        fontWeight: '600'
                                    }}>
                                        Total Marks *
                                    </label>
                                    <input
                                        type="number"
                                        name="totalMarks"
                                        value={formData.totalMarks}
                                        onChange={handleInputChange}
                                        min="1"
                                        placeholder="e.g., 20"
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
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '8px',
                                    color: '#2c3e50',
                                    fontSize: '16px',
                                    fontWeight: '600'
                                }}>
                                    Grading Rubric (Optional)
                                </label>
                                <select
                                    name="rubricId"
                                    value={formData.rubricId}
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
                                >
                                    <option value="">No rubric - Simple grading</option>
                                    {rubrics.map(rubric => (
                                        <option key={rubric.id} value={rubric.id}>
                                            {rubric.title} ({rubric.totalMarks} marks)
                                        </option>
                                    ))}
                                </select>
                                <small style={{ color: '#666', fontSize: '14px' }}>
                                    Select an existing rubric for detailed grading criteria
                                </small>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', gap: '15px' }}>
                            <button
                                onClick={handleCreate}
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
                                {isLoading ? 'Creating Assignment...' : 'Create Assignment'}
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

                    {/* Right Column - Preview & Analytics */}
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
                                Assignment Summary
                            </h3>

                            {/* Assignment Preview */}
                            <div style={{
                                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                                borderRadius: '12px',
                                padding: '20px',
                                marginBottom: '20px',
                                border: '1px solid rgba(102, 126, 234, 0.2)'
                            }}>
                                <h4 style={{ margin: '0 0 15px 0', color: '#2c3e50', fontSize: '16px' }}>
                                    Preview
                                </h4>

                                <div style={{ marginBottom: '15px' }}>
                                    <strong>Title:</strong> {formData.title || 'Not specified'}
                                </div>

                                <div style={{ marginBottom: '15px' }}>
                                    <strong>Subject:</strong> {formData.subject || 'Not selected'}
                                </div>

                                <div style={{ marginBottom: '15px' }}>
                                    <strong>Class:</strong> {formData.classSemester || 'Not selected'}
                                </div>

                                <div style={{ marginBottom: '15px' }}>
                                    <strong>Due:</strong> {formData.dueDate && formData.dueTime ? `${formData.dueDate} ${formData.dueTime}` : 'Not set'}
                                </div>

                                <div style={{ marginBottom: '15px' }}>
                                    <strong>Marks:</strong> {formData.totalMarks || 'Not set'}
                                </div>

                                <div style={{ marginBottom: '15px' }}>
                                    <strong>Students:</strong> {
                                        formData.accessType === 'ALL_CLASS'
                                            ? filteredStudents.length
                                            : formData.assignedStudents.length
                                    }
                                </div>

                                {file && (
                                    <div style={{ marginBottom: '15px' }}>
                                        <strong>Attachment:</strong> {file.name}
                                    </div>
                                )}
                            </div>

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
                                    <span style={{ fontSize: '14px', color: '#666' }}>Expected Submissions:</span>
                                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#28a745' }}>
                                        {formData.accessType === 'ALL_CLASS' ? filteredStudents.length : formData.assignedStudents.length}
                                    </span>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                    <span style={{ fontSize: '14px', color: '#666' }}>Submission Type:</span>
                                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#667eea' }}>
                                        {submissionTypes.find(t => t.value === formData.submissionType)?.label || 'File Upload'}
                                    </span>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                    <span style={{ fontSize: '14px', color: '#666' }}>Late Policy:</span>
                                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#9c27b0' }}>
                                        {lateSubmissionPolicies.find(p => p.value === formData.lateSubmissionPolicy)?.label || 'Allow'}
                                    </span>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ fontSize: '14px', color: '#666' }}>File Size Limit:</span>
                                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#ff9800' }}>
                                        {formData.maxFileSize}MB
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

export default CreateAssignment;
