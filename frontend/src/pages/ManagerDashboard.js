import React, { useState, useEffect } from 'react';
import API from '../services/api';
import useAuthStore from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import '../App.css';

const ManagerDashboard = () => {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, present: 0 });
    
    // Profile Dropdown State
    const [showProfile, setShowProfile] = useState(false);

    useEffect(() => {
        document.title = "Manager Dashbord";
        fetchAllAttendance();
    }, []);

    const fetchAllAttendance = async () => {
        try {
            const { data } = await API.get('/attendance/all');
            if (Array.isArray(data)) {
                // Filter out records where user is null (Deleted Users)
                // యూజర్ లేని పాత రికార్డ్స్ ని తీసేస్తున్నాం
                const validRecords = data.filter(rec => rec.userId !== null);
                
                setRecords(validRecords);
                calculateStats(validRecords);
            }
        } catch (err) {
            console.error("Error fetching data:", err);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (data) => {
        const today = new Date().toISOString().split('T')[0];
        const presentToday = data.filter(rec => rec.date === today && rec.status !== 'Absent').length;
        // Total unique employees count logic can be improved, but for now using records length
        setStats({ total: data.length, present: presentToday });
    };

    const handleExportCSV = () => {
        let csvContent = "data:text/csv;charset=utf-8,Name,Employee ID,Date,Status,Check In,Check Out\n";
        records.forEach(rec => {
            const row = [
                rec.userId?.name || 'Unknown',
                rec.userId?.employeeId || '-',
                rec.date,
                rec.status,
                rec.checkInTime ? new Date(rec.checkInTime).toLocaleTimeString() : '-',
                rec.checkOutTime ? new Date(rec.checkOutTime).toLocaleTimeString() : '-'
            ].join(",");
            csvContent += row + "\n";
        });
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "attendance_report.csv");
        document.body.appendChild(link);
        link.click();
    };

    if (loading) return <h2 style={{textAlign: 'center', marginTop: '50px'}}>Loading...</h2>;

    return (
        <div className="dashboard-container">
            
            {/* 1. NAVBAR (Header with Profile) */}
            <div className="navbar">
                <h2 style={{color: '#667eea', margin: 0}}>Manager Portal 👨‍💼</h2>

                {/* Profile Icon (Top Right) */}
                <div className="profile-menu-container">
                    <button 
                        className="profile-icon-btn" 
                        onClick={() => setShowProfile(!showProfile)}
                    >
                        👤
                    </button>

                    {/* Dropdown Menu */}
                    {showProfile && (
                        <div className="profile-dropdown">
                            <h4 style={{textAlign:'center', marginBottom:'10px', color: '#667eea'}}>Admin Profile</h4>
        
                            <div className="dropdown-item">
                                Name: <strong>{user?.name}</strong>
                            </div>
        
                            {/* NEW: ID Field Added */}
                            <div className="dropdown-item">
                                Manager ID: <strong>{user?.employeeId || 'Not Generated'}</strong>
                            </div>
        
                            <div className="dropdown-item">
                                Department: <strong>{user?.department || 'Management'}</strong>
                            </div>

                            <div className="dropdown-item">
                                Email: <strong>{user?.email}</strong>
                            </div>
        
                            <button 
                                onClick={() => { logout(); navigate('/login'); }} 
                                className="btn-logout" 
                                style={{marginTop: '10px', padding: '10px', fontSize: '14px', background: '#ff4d4d', color: 'white'}}
                            >
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* 2. STATS & ACTIONS (Horizontal Layout) */}
            <div className="stats-grid">
                <div className="stat-card">
                    <h3>Present Today</h3>
                    <div className="stat-number" style={{color: '#276749'}}>{stats.present}</div>
                </div>
                <div className="stat-card">
                    <h3>Total Records</h3>
                    <div className="stat-number" style={{color: '#2b6cb0'}}>{stats.total}</div>
                </div>
                {/* CSV Download Card */}
                <div className="stat-card" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
                    <h3>Reports</h3>
                    <button onClick={handleExportCSV} className="btn-primary" style={{marginTop: '10px', width: 'auto', padding: '10px 20px'}}>
                        📥 Download CSV
                    </button>
                </div>
            </div>

            {/* 3. TABLE SECTION */}
            <div className="table-container" style={{width: '100%', marginTop: '20px'}}>
                <h3 style={{marginBottom: '15px', color: '#555'}}>Employee Attendance Log</h3>
                <table className="modern-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Emp ID</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Check In</th>
                            <th>Check Out</th>
                        </tr>
                    </thead>
                    <tbody>
                        {records.map((rec, index) => (
                            <tr key={index}>
                                {/* Name and ID Styling */}
                                <td style={{fontWeight: 'bold', color: '#333'}}>{rec.userId?.name}</td>
                                <td style={{color: '#667eea'}}>{rec.userId?.employeeId}</td>
                                <td>{rec.date}</td>
                                
                                {/* Status Badge */}
                                <td>
                                    <span style={{
                                        padding: '5px 10px',
                                        borderRadius: '12px',
                                        fontSize: '12px',
                                        fontWeight: 'bold',
                                        background: rec.status === 'Absent' ? '#fff5f5' : (rec.status === 'Late' ? '#fffaf0' : '#e6fffa'),
                                        color: rec.status === 'Absent' ? '#c53030' : (rec.status === 'Late' ? '#dd6b20' : '#276749')
                                    }}>
                                        {rec.status}
                                    </span>
                                </td>
                                
                                <td>{new Date(rec.checkInTime).toLocaleTimeString()}</td>
                                <td>{rec.checkOutTime ? new Date(rec.checkOutTime).toLocaleTimeString() : '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                
                {records.length === 0 && (
                    <p style={{textAlign: 'center', padding: '20px', color: '#888'}}>No attendance records found.</p>
                )}
            </div>
        </div>
    );
};

export default ManagerDashboard;