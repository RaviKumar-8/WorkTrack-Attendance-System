import React, { useState } from 'react';
import API from '../services/api';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    // employeeId ని కూడా స్టేట్ లో యాడ్ చేశాం
    const [formData, setFormData] = useState({ 
        name: '', 
        email: '', 
        password: '', 
        role: 'employee',
        employeeId: '' // New Field
    });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await API.post('/auth/register', formData);
            alert('Registration Successful! Please Login.');
            navigate('/login');
        } catch (err) {
            // Error handling improved here
            const errorMessage = err.response?.data?.error || err.response?.data?.message || "Something went wrong";
            alert('Registration Failed: ' + errorMessage);
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '400px', margin: 'auto' }}>
            <h2>Register New Employee</h2>
            <form onSubmit={handleSubmit}>
                <input 
                    type="text" 
                    placeholder="Full Name" 
                    onChange={(e) => setFormData({...formData, name: e.target.value})} 
                    required 
                /><br/><br/>
                
                {/* Employee ID Input Field Added Here */}
                <input 
                    type="text" 
                    placeholder="Employee ID (e.g., EMP001)" 
                    onChange={(e) => setFormData({...formData, employeeId: e.target.value})} 
                    required 
                /><br/><br/>

                <input 
                    type="email" 
                    placeholder="Email" 
                    onChange={(e) => setFormData({...formData, email: e.target.value})} 
                    required 
                /><br/><br/>
                
                <input 
                    type="password" 
                    placeholder="Password" 
                    onChange={(e) => setFormData({...formData, password: e.target.value})} 
                    required 
                /><br/><br/>
                
                <select onChange={(e) => setFormData({...formData, role: e.target.value})}>
                    <option value="employee">Employee</option>
                    <option value="manager">Manager</option>
                </select><br/><br/>
                
                <button type="submit">Register</button>
            </form>
            <p>Already have an account? <a href="/login">Login here</a></p>
        </div>
    );
};

export default Register;