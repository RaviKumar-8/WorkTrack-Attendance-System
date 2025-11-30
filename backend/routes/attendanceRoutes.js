const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');

// Middleware to verify Token (Simple implementation)
const verifyToken = (req, res, next) => {
    // Note: In real project, use proper JWT verification middleware here
    // For now, assume req.body.userId comes from frontend or decoded token
    next();
};

// Check-In Logic
router.post('/checkin', async (req, res) => {
    const { userId } = req.body;
    const date = new Date().toISOString().split('T')[0]; // Current Date (YYYY-MM-DD)
    const checkInTime = new Date();

    // Logic to determine if "Late" (e.g., after 9:30 AM)
    const status = checkInTime.getHours() > 9 || (checkInTime.getHours() === 9 && checkInTime.getMinutes() > 30) ? 'Late' : 'Present';

    try {
        // Check if already checked in
        const existing = await Attendance.findOne({ userId, date });
        if (existing) return res.status(400).json({ message: "Already checked in today" });

        const newAttendance = new Attendance({ userId, date, checkInTime, status });
        await newAttendance.save();
        res.status(201).json(newAttendance);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Check-Out Logic
router.post('/checkout', async (req, res) => {
    const { userId } = req.body;
    const date = new Date().toISOString().split('T')[0];
    const checkOutTime = new Date();

    try {
        const attendance = await Attendance.findOne({ userId, date });
        if (!attendance) return res.status(404).json({ message: "You haven't checked in yet" });

        attendance.checkOutTime = checkOutTime;
        
        // Calculate Total Hours
        const duration = checkOutTime - new Date(attendance.checkInTime);
        attendance.totalHours = duration / (1000 * 60 * 60); // Convert ms to hours

        await attendance.save();
        res.json(attendance);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get My History
router.get('/my-history', async (req, res) => {
    // Note: Real project lo Token nundi userId teeskovali.
    // Ikkada test kosam hardcode chestunnam ledha query param vaadochu.
    // Kani frontend lo manam Token pampatledhu kabatti, simple ga cheddam:
    
    // TEMPORARY FIX: Frontend nundi userId header lo pampiddam later.
    // Ippudu easy ga undadaniki: Last lo add chesina record test chestam.
    
    // Better way for your level:
    try {
        const { userId } = req.params; // URL నుంచి ID ని తీసుకుంటున్నాం
        
        // డేటాబేస్ లో ఆ userId ఉన్న రికార్డ్స్ మాత్రమే వెతుకుతాం
        const logs = await Attendance.find({ userId }).sort({ createdAt: -1 });
        
        res.json(logs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Get All Attendance (For Manager) ---
router.get('/all', async (req, res) => {
    try {
        // Attendance తెచ్చేటప్పుడు, User వివరాలు (Name, Email) కూడా కలిపి తేవాలి (.populate వాడతాం)
        const records = await Attendance.find().populate('userId', 'name email employeeId department');
        res.json(records);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;