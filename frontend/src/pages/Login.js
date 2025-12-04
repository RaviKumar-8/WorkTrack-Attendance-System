import React, { useState, useEffect } from 'react';
import API from '../services/api';
import useAuthStore from '../store/authStore';
import { useNavigate, Link } from 'react-router-dom';
import '../App.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const login = useAuthStore((state) => state.login);
    const navigate = useNavigate();

    useEffect(() => {
        document.title = "EAS Login";
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await API.post('/auth/login', { email, password });
            login(data.user, data.token);
            if (data.user.role === 'manager') navigate('/manager-dashboard');
            else navigate('/employee-dashboard');
        } catch (err) {
            alert('Login Failed: ' + (err.response?.data?.message || 'Error'));
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Welcome Back</h2>
                <p style={{marginBottom: '20px', color: '#666'}}>Please login to your account</p>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <input className="form-input" type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <input className="form-input" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    <button className="btn-primary" type="submit">Login</button>
                </form>
                <div className="link-text">
                    Don't have an account? <Link to="/register">Register here</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;