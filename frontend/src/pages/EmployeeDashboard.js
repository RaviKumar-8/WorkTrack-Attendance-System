import React, { useState, useEffect } from 'react';
import API from '../services/api';
import useAuthStore from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import '../App.css';

const EmployeeDashboard = () => {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    
    const [status, setStatus] = useState('Not Checked In');
    const [logs, setLogs] = useState([]);
    const [showProfile, setShowProfile] = useState(false);
    const [showSummary, setShowSummary] = useState(false);
    
    // Stats State (Absent added)
    const [stats, setStats] = useState({ present: 0, late: 0, absent: 0, totalHours: 0 });

    useEffect(() => {
        document.title="Employee Dashbord";

        if(user) {
            fetchHistory();
        }
    }, [user]);

    const fetchHistory = async () => {
        try {
            const { data } = await API.get(`/attendance/my-history/${user.id}`);
            setLogs(data);
            
            // --- NEW CALCULATION LOGIC ---
            const todayDate = new Date();
            const currentMonth = todayDate.getMonth(); // 0-11
            const currentYear = todayDate.getFullYear();
            const dayOfMonth = todayDate.getDate(); // ఈ రోజు ఎన్నో తారీఖు (e.g., 5)

            // ఈ నెలలో ఉన్న రికార్డ్స్ మాత్రమే ఫిల్టర్ చేద్దాం
            const thisMonthLogs = data.filter(log => {
                const logDate = new Date(log.date);
                return logDate.getMonth() === currentMonth && logDate.getFullYear() === currentYear;
            });

            let presentCount = 0;
            let lateCount = 0;
            let hoursCount = 0;

            thisMonthLogs.forEach(record => {
                if (record.status === 'Late') lateCount++;
                else if (record.status === 'Present' || record.status === 'Completed') presentCount++;
                
                if (record.totalHours) hoursCount += record.totalHours;
            });

            // Absent Calculation: (ఈ రోజు తేదీ) - (వచ్చిన రోజులు)
            // గమనిక: ఇది ఆదివారాలను కూడా ఆబ్సెంట్ కింద లెక్కిస్తుంది (Simple Logic)
            let absentCount = dayOfMonth - (presentCount + lateCount);
            if (absentCount < 0) absentCount = 0; // Negative రాకుండా

            setStats({
                present: presentCount,
                late: lateCount,
                absent: absentCount, // New Field
                totalHours: hoursCount.toFixed(1)
            });
            
            // Check Today's Status
            const todayStr = todayDate.toISOString().split('T')[0];
            const todayRecord = data.find(log => log.date === todayStr);
            
            if (todayRecord) {
                if (todayRecord.checkOutTime) setStatus('Completed');
                else setStatus('Checked In');
            }
        } catch (err) {
            console.error("History Error:", err);
        }
    };

    const handleCheckIn = async () => { 
        try {
            await API.post('/attendance/checkin', { userId: user.id }); 
            alert('Checked In Successfully!');
            fetchHistory(); 
            setStatus('Checked In'); 
        } catch (err) { alert(err.response?.data?.message || 'Error Checking In'); }
    };

    const handleCheckOut = async () => { 
        try {
            await API.post('/attendance/checkout', { userId: user.id }); 
            alert('Checked Out Successfully!');
            fetchHistory(); 
            setStatus('Completed'); 
        } catch (err) { alert(err.response?.data?.message || 'Error Checking Out'); }
    };

    return (
        <div className="dashboard-container">
            {/* Navbar */}
            <div className="navbar">
                <h2 style={{color: '#667eea', margin: 0}}>Employee Portal 👨‍💻</h2>
                
                <div className="profile-menu-container">
                    <button className="profile-icon-btn" onClick={() => setShowProfile(!showProfile)}>👤</button>
                    
                    {showProfile && (
                        <div className="profile-dropdown">
                            <h4 style={{textAlign:'center', marginBottom:'10px', color: '#667eea'}}>My Profile</h4>
                            <div className="dropdown-item">Name: <strong>{user?.name}</strong></div>
                            <div className="dropdown-item">Id: <strong>{user?.employeeId || 'Not Generated'}</strong></div>
                            <div className="dropdown-item">Dept: <strong>{user?.department || 'Not Assigned'}</strong></div>
                            <div className="dropdown-item">Email: <strong>{user?.email}</strong></div>
                            <button 
                                onClick={() => { setShowSummary(true); setShowProfile(false); }} 
                                className="btn-primary" 
                                style={{marginTop:'10px', padding:'10px', fontSize:'14px', background:'#667eea', color:'white', width: '100%'}}
                            >
                                📊 View Summary
                            </button>

                            <button onClick={() => { logout(); navigate('/login'); }} className="btn-logout" style={{marginTop:'10px', padding:'10px', fontSize:'14px', background:'#ff4d4d', color:'white'}}>Logout</button>
                        </div>
                    )}
                </div>
            </div>

            {/* --- SUMMARY MODAL (Updated with Absent) --- */}
            {showSummary && (
                <div style={modalOverlayStyle}>
                    <div className="stat-card" style={{position: 'relative', width: '350px', zIndex: 1000}}>
                        <button 
                            onClick={() => setShowSummary(false)} 
                            style={{position: 'absolute', top: '10px', right: '15px', background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer'}}
                        >✖</button>
                        
                        <h3 style={{marginBottom: '20px', color: '#333'}}>Monthly Report 📅</h3>
                        
                        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '10px'}}>
                            <span>✅ Days Present:</span>
                            <span style={{fontWeight: 'bold', color: 'green'}}>{stats.present}</span>
                        </div>
                        
                        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '10px'}}>
                            <span>⏰ Days Late:</span>
                            <span style={{fontWeight: 'bold', color: 'orange'}}>{stats.late}</span>
                        </div>

                        {/* NEW: Absent Row */}
                        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '10px'}}>
                            <span>❌ Days Absent:</span>
                            <span style={{fontWeight: 'bold', color: 'red'}}>{stats.absent}</span>
                        </div>
                        
                        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '15px'}}>
                            <span>⏳ Total Hours:</span>
                            <span style={{fontWeight: 'bold', color: '#667eea'}}>{stats.totalHours} hrs</span>
                        </div>
                        
                        <button onClick={() => setShowSummary(false)} className="btn-primary" style={{marginTop: '20px'}}>Close</button>
                    </div>
                </div>
            )}

            {/* Status Card */}
            <div className="stat-card" style={{textAlign: 'center', marginTop: '20px'}}>
                <h3>Today's Status</h3>
                <h1 style={{fontSize: '3.5rem', margin: '20px 0', color: status === 'Checked In' ? '#276749' : (status === 'Completed' ? '#2b6cb0' : '#e53e3e')}}>{status}</h1>
                {status === 'Not Checked In' && <button onClick={handleCheckIn} className="btn-primary" style={{maxWidth: '300px'}}>Check In Now 🟢</button>}
                {status === 'Checked In' && <button onClick={handleCheckOut} className="btn-primary" style={{maxWidth: '300px', color: '#c53030'}}>Check Out 🔴</button>}
            </div>

            {/* History Table */}
            <div className="table-container" style={{marginTop: '30px', width: '100%'}}>
                <h3>Recent Attendance</h3>
                <table className="modern-table">
                    <thead><tr><th>Date</th><th>Status</th><th>In Time</th><th>Out Time</th></tr></thead>
                    <tbody>
                        {logs.map((log) => (
                            <tr key={log._id}>
                                <td>{log.date}</td>
                                <td><span style={{color: log.status==='Absent'?'red':(log.status==='Late'?'orange':'green'), fontWeight:'bold'}}>{log.status}</span></td>
                                <td>{new Date(log.checkInTime).toLocaleTimeString()}</td>
                                <td>{log.checkOutTime ? new Date(log.checkOutTime).toLocaleTimeString() : '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// Modal Background Style
const modalOverlayStyle = {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    zIndex: 999
};

export default EmployeeDashboard;