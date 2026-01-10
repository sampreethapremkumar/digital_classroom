import React, { useState, useEffect } from 'react';
import axios from '../api';
import { useNavigate } from 'react-router-dom';

const ViewNotes = () => {
    const [notes, setNotes] = useState([]);
    const [downloading, setDownloading] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchNotes();
    }, []);

    const fetchNotes = async () => {
        try {
            const response = await axios.get('/api/student/notes');
            setNotes(response.data);
        } catch (error) {
            console.error('Error fetching notes:', error);
        }
    };

    const handleDownload = async (noteId, fileName) => {
        setDownloading(noteId);
        try {
            const response = await axios.get(`/api/notes/download/${noteId}`, {
                responseType: 'blob'
            });

            // Create a temporary link element for download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            link.style.display = 'none';

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Clean up the URL object
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading note:', error);
        } finally {
            setDownloading(null);
        }
    };

    const buttonStyle = {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        border: 'none',
        padding: '12px 24px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '16px',
        fontWeight: '600',
        transition: 'all 0.3s ease',
        display: 'inline-block',
        textDecoration: 'none',
        textAlign: 'center',
        whiteSpace: 'nowrap',
        transform: 'none', // Explicitly prevent rotation
        writingMode: 'horizontal-tb', // Ensure horizontal writing
        textOrientation: 'mixed' // Prevent vertical text
    };

    const downloadButtonStyle = {
        ...buttonStyle,
        background: downloading ? '#6c757d' : 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
        cursor: downloading ? 'not-allowed' : 'pointer',
        minWidth: '140px'
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
                        Study Materials
                    </h1>
                    <p style={{
                        margin: 0,
                        color: '#666',
                        fontSize: '16px',
                        fontWeight: '500'
                    }}>
                        Access your course notes and study materials
                    </p>
                </div>

                <div style={{ marginBottom: '40px' }}>
                    {notes.length === 0 ? (
                        <div style={{
                            textAlign: 'center',
                            padding: '60px 20px',
                            background: 'rgba(200, 200, 200, 0.1)',
                            borderRadius: '15px',
                            border: '2px dashed rgba(200, 200, 200, 0.5)'
                        }}>
                            <div style={{
                                fontSize: '48px',
                                marginBottom: '20px',
                                color: '#ccc',
                                fontWeight: 'bold'
                            }}>
                                BOOKS
                            </div>
                            <h3 style={{ margin: '0 0 10px 0', color: '#666' }}>No Notes Available</h3>
                            <p style={{ margin: 0, color: '#999' }}>Check back later for new study materials</p>
                        </div>
                    ) : (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                            gap: '25px'
                        }}>
                            {notes.map(note => (
                                <div
                                    key={note.id}
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.9)',
                                        borderRadius: '15px',
                                        padding: '25px',
                                        boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
                                        border: '1px solid rgba(102, 126, 234, 0.1)',
                                        transition: 'all 0.3s ease',
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-5px)';
                                        e.currentTarget.style.boxShadow = '0 15px 40px rgba(0, 0, 0, 0.15)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.1)';
                                    }}
                                >
                                    {/* Subject Badge */}
                                    {note.subject && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '15px',
                                            right: '15px',
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            color: 'white',
                                            padding: '6px 12px',
                                            borderRadius: '20px',
                                            fontSize: '12px',
                                            fontWeight: '600',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px'
                                        }}>
                                            {note.subject}
                                        </div>
                                    )}

                                    <div style={{ marginBottom: '20px' }}>
                                        <h3 style={{
                                            margin: '0 0 10px 0',
                                            color: '#2c3e50',
                                            fontSize: '20px',
                                            fontWeight: '700',
                                            lineHeight: '1.3'
                                        }}>
                                            {note.title}
                                        </h3>

                                        {note.description && (
                                            <p style={{
                                                margin: '0 0 15px 0',
                                                color: '#666',
                                                fontSize: '14px',
                                                lineHeight: '1.5'
                                            }}>
                                                {note.description}
                                            </p>
                                        )}

                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            marginBottom: '20px',
                                            fontSize: '13px',
                                            color: '#888'
                                        }}>
                                            <span>File: {note.fileName}</span>
                                            {note.downloadCount !== undefined && (
                                                <span>{note.downloadCount} downloads</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Download Button - Explicitly horizontal */}
                                    <button
                                        onClick={() => handleDownload(note.id, note.fileName)}
                                        disabled={downloading === note.id}
                                        style={downloadButtonStyle}
                                    >
                                        {downloading === note.id ? 'Downloading...' : 'Download'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div style={{ textAlign: 'center' }}>
                    <button
                        style={buttonStyle}
                        onClick={() => navigate('/student')}
                    >
                        ← Back to Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ViewNotes;
