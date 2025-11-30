import React, { useState, useEffect } from 'react';
import API from '../services/api';
import useAuthStore from '../store/authStore';
import { useNavigate } from 'react-router-dom';

const ManagerDashboard = () => {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, present: 0 });

    useEffect(() => {
        fetchAllAttendance();
    }, []);

    const fetchAllAttendance = async () => {
        try {
            const { data } = await API.get('/attendance/all');
            if (Array.isArray(data)) {
                setRecords(data);
                calculateStats(data);
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
        setStats({ total: data.length, present: presentToday });
    };

    // --- NEW FEATURE: Export to CSV ---
    const handleExportCSV = () => {
        // 1. Table Headers
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Name,Employee ID,Date,Status,Check In,Check Out\n";

        // 2. Add Data Rows
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

        // 3. Trigger Download
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "attendance_report.csv");
        document.body.appendChild(link);
        link.click();
    };

    if (loading) return <h2 style={{textAlign: 'center', marginTop: '50px'}}>Loading...</h2>;

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #eee', paddingBottom: '15px' }}>
                <h1 style={{ color: '#333' }}>Manager Dashboard 👨‍💼</h1>
                <button onClick={() => { logout(); navigate('/login'); }} style={logoutBtnStyle}>Logout</button>
            </div>

            {/* Stats & Actions */}
            <div style={{ display: 'flex', gap: '20px', margin: '20px 0', alignItems: 'center' }}>
                <div style={cardStyle}>
                    <h3>Present Today</h3>
                    <h1 style={{color: 'green', margin: 0}}>{stats.present}</h1>
                </div>
                <div style={cardStyle}>
                    <h3>Total Records</h3>
                    <h1 style={{color: 'blue', margin: 0}}>{stats.total}</h1>
                </div>
                
                {/* Export Button */}
                <button onClick={handleExportCSV} style={exportBtnStyle}>
                    📥 Download Report (CSV)
                </button>
            </div>

            {/* Table */}
            <h3>Employee Attendance Records</h3>
            <table border="1" cellPadding="12" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', borderColor: '#ddd' }}>
                <thead style={{ background: '#007bff', color: 'white' }}>
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
                        <tr key={index} style={{ background: index % 2 === 0 ? '#f9f9f9' : 'white' }}>
                            <td>{rec.userId?.name}</td>
                            <td>{rec.userId?.employeeId}</td>
                            <td>{rec.date}</td>
                            <td style={{ fontWeight: 'bold', color: rec.status === 'Absent' ? 'red' : 'green' }}>{rec.status}</td>
                            <td>{new Date(rec.checkInTime).toLocaleTimeString()}</td>
                            <td>{rec.checkOutTime ? new Date(rec.checkOutTime).toLocaleTimeString() : '-'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

// Styles
const cardStyle = {
    border: '1px solid #ddd', padding: '20px', borderRadius: '8px', 
    width: '200px', textAlign: 'center', background: 'white', boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
};

const logoutBtnStyle = {
    background: '#ff4d4d', color: 'white', padding: '10px 20px', 
    border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold'
};

const exportBtnStyle = {
    background: '#28a745', color: 'white', padding: '15px 30px', 
    border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', marginLeft: 'auto'
};

export default ManagerDashboard;