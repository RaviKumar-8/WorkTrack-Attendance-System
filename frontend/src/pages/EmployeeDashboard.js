import React, { useState, useEffect } from 'react';
import API from '../services/api';
import useAuthStore from '../store/authStore';
import { useNavigate } from 'react-router-dom';

const EmployeeDashboard = () => {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const [status, setStatus] = useState('Not Checked In');
    const [logs, setLogs] = useState([]);

    // పేజీ లోడ్ అవ్వగానే పాత హిస్టరీ తెచ్చుకోవాలి
    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const { data } = await API.get('/attendance/my-history'); // [cite: 14]
            setLogs(data);
            
            // ఈ రోజు అటెండెన్స్ వేశారా లేదా అని చెక్ చేద్దాం
            const today = new Date().toISOString().split('T')[0];
            const todayRecord = data.find(log => log.date === today);
            
            if (todayRecord) {
                if (todayRecord.checkOutTime) setStatus('Completed');
                else setStatus('Checked In');
            }
        } catch (err) {
            console.error("Failed to fetch history");
        }
    };

    const handleCheckIn = async () => {
        try {
            await API.post('/attendance/checkin', { userId: user.id }); // [cite: 55]
            alert('Checked In Successfully!');
            fetchHistory();
            setStatus('Checked In');
        } catch (err) {
            alert(err.response?.data?.message);
        }
    };

    const handleCheckOut = async () => {
        try {
            await API.post('/attendance/checkout', { userId: user.id }); // [cite: 57]
            alert('Checked Out Successfully!');
            fetchHistory();
            setStatus('Completed');
        } catch (err) {
            alert(err.response?.data?.message);
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>Welcome, {user?.name}</h1>
            <button onClick={() => { logout(); navigate('/login'); }} style={{ float: 'right', background: 'red', color: 'white' }}>Logout</button>
            
            {/* Status Card */}
            <div style={{ border: '1px solid #ccc', padding: '20px', margin: '20px 0', background: '#f9f9f9' }}>
                <h3>Today's Status: <span style={{ color: status === 'Checked In' ? 'green' : 'red' }}>{status}</span></h3>
                
                {status === 'Not Checked In' && <button onClick={handleCheckIn} style={{ fontSize: '18px', padding: '10px 20px', background: 'green', color: 'white' }}>Check In 🟢</button>}
                
                {status === 'Checked In' && <button onClick={handleCheckOut} style={{ fontSize: '18px', padding: '10px 20px', background: 'orange', color: 'white' }}>Check Out 🔴</button>}
                
                {status === 'Completed' && <p>You have completed your work for today!</p>}
            </div>

            {/* Attendance History Table */}
            <h3>My Attendance History</h3>
            <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Check In</th>
                        <th>Check Out</th>
                        <th>Total Hours</th>
                    </tr>
                </thead>
                <tbody>
                    {logs.map((log) => (
                        <tr key={log._id}>
                            <td>{log.date}</td>
                            <td>{log.status}</td>
                            <td>{new Date(log.checkInTime).toLocaleTimeString()}</td>
                            <td>{log.checkOutTime ? new Date(log.checkOutTime).toLocaleTimeString() : '-'}</td>
                            <td>{log.totalHours ? log.totalHours.toFixed(2) : '-'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default EmployeeDashboard;