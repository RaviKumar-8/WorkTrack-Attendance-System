import React, { useState } from 'react';
import API from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import '../App.css';

const Register = () => {
    const [formData, setFormData] = useState({ 
        name: '', email: '', password: '', role: 'employee', department: 'IT' 
    });
    const [confirmPassword, setConfirmPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }
        try {
            const { data } = await API.post('/auth/register', formData);
            alert(data.message); 
            navigate('/login');
        } catch (err) {
            alert('Error: ' + (err.response?.data?.message || "Registration Failed"));
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2 style={{textAlign:'center', marginBottom: '20px'}}>Create Account</h2>
                <form onSubmit={handleSubmit}>
                    <input className="form-input" type="text" placeholder="Full Name" onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                    
                    {/* 1. ROLE SELECTION (ఇది మళ్ళీ యాడ్ చేశాం) */}
                    <div className="form-group">
                        <label style={{marginLeft:'5px', fontSize:'14px', color:'#666'}}>Select Role:</label>
                        <select className="form-select" onChange={(e) => setFormData({...formData, role: e.target.value})}>
                            <option value="employee">Employee</option>
                            <option value="manager">Manager</option>
                        </select>
                    </div>

                    {/* 2. DEPARTMENT SELECTION */}
                    <div className="form-group">
                        <label style={{marginLeft:'5px', fontSize:'14px', color:'#666'}}>Select Department:</label>
                        <select className="form-select" onChange={(e) => setFormData({...formData, department: e.target.value})}>
                            <option value="IT">IT Department</option>
                            <option value="HR">HR Department</option>
                            <option value="Sales">Sales</option>
                            <option value="Marketing">Marketing</option>
                        </select>
                    </div>

                    <input className="form-input" type="email" placeholder="Email Address" onChange={(e) => setFormData({...formData, email: e.target.value})} required />
                    <input className="form-input" type="password" placeholder="Password" onChange={(e) => setFormData({...formData, password: e.target.value})} required />
                    <input className="form-input" type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                    
                    <button className="btn-primary" type="submit">Register Now</button>
                </form>
                <div style={{textAlign: 'center', marginTop: '20px'}}>
                    Already have an account? <Link to="/login" style={{color: '#667eea', fontWeight: 'bold'}}>Login</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;