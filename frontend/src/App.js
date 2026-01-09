import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import AdminLogin from './components/AdminLogin';
import TeacherLogin from './components/TeacherLogin';
import StudentLogin from './components/StudentLogin';
import TeacherLayout from './components/TeacherLayout';
import StudentLayout from './components/StudentLayout';
import AdminDashboard from './components/AdminDashboard';
import GradeAssignment from './components/GradeAssignment';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/teacher/login" element={<TeacherLogin />} />
          <Route path="/teacher/*" element={<TeacherLayout />} />
          <Route path="/teacher/grade-assignment/:submissionId" element={<GradeAssignment />} />
          <Route path="/student/login" element={<StudentLogin />} />
          <Route path="/student/*" element={<StudentLayout />} />
          <Route path="/" element={<Register />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
