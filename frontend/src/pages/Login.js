import React, { useState } from 'react';
import API from '../services/api';
import useAuthStore from '../store/authStore';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const login = useAuthStore((state) => state.login);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await API.post('/auth/login', { email, password });
            login(data.user, data.token);
            alert('Login Successful!');
            
            // Role ని బట్టి వేరే పేజీకి పంపాలి
            if (data.user.role === 'manager') {
                navigate('/manager-dashboard');
            } else {
                navigate('/employee-dashboard');
            }
        } catch (err) {
            alert('Login Failed: ' + (err.response?.data?.message || 'Error'));
        }
    };

    return (
        <div style={{ padding: '50px', textAlign: 'center' }}>
            <h2>Attendance System Login</h2>
            <form onSubmit={handleSubmit} style={{ display: 'inline-block', textAlign: 'left' }}>
                <div>
                    <label>Email:</label><br/>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <br/>
                <div>
                    <label>Password:</label><br/>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <br/>
                <button type="submit">Login</button>
            </form>
            <p>Don't have an account? <a href="/register">Register here</a></p>
        </div>
    );
};

export default Login;