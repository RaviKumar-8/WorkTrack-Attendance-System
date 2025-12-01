const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register User
router.post('/register', async (req, res) => {
    // Note: department field added
    const { name, email, password, role, department } = req.body; 
    
    try {
        // 1. Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "Email already exists" });

        // 2. Generate Auto Employee ID (Only for Employees)
        let newEmployeeId = '';
        if (role === 'employee') {
            // చివరి ఎంప్లాయీని వెతికి తీసుకురావాలి (Sort by CreatedAt Descending)
            const lastUser = await User.findOne({ role: 'employee' }).sort({ createdAt: -1 });
            
            if (lastUser && lastUser.employeeId) {
                // Last ID: EMP005 అనుకుందాం.
                // "EMP" తీసేసి "005" ని నంబర్ (5) గా మారుస్తాం
                const lastIdNum = parseInt(lastUser.employeeId.replace('EMP', ''));
                // 1 యాడ్ చేసి మళ్ళీ ఫార్మాట్ చేస్తాం (EMP006)
                newEmployeeId = 'EMP' + String(lastIdNum + 1).padStart(3, '0');
            } else {
                // ఎవరూ లేకపోతే ఇదే ఫస్ట్ ఐడి
                newEmployeeId = 'EMP001';
            }
        } else {
            newEmployeeId = 'MGR' + Math.floor(1000 + Math.random() * 9000); // Manager ID Random
        }

        // 3. Save User
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ 
            name, 
            email, 
            password: hashedPassword, 
            role, 
            employeeId: newEmployeeId, // Auto Generated ID
            department // New Field
        });
        
        await newUser.save();
        res.status(201).json({ message: `User registered! Your ID is ${newEmployeeId}` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Login User
// Login User Section లో...
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
        
        // FIX: ఇక్కడ అన్ని వివరాలు పంపాలి (employeeId, department, email)
        res.json({ 
            token, 
            user: { 
                id: user._id, 
                name: user.name, 
                role: user.role, 
                employeeId: user.employeeId, // This was missing
                department: user.department, // This was missing
                email: user.email 
            } 
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Temporary Clean Up Route ---
router.get('/cleanup', async (req, res) => {
    try {
        // ఇది Users మొత్తాన్ని మరియు ఆ పాత Indexes ని డిలీట్ చేస్తుంది
        await User.collection.drop();
        res.send("Success! Users collection and Indexes are deleted. Now try Registering again.");
    } catch (err) {
        res.send("Error (Maybe already empty): " + err.message);
    }
});

module.exports = router;