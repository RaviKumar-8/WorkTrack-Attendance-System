const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register User
router.post('/register', async (req, res) => {
    const { name, email, password, role, employeeId, department } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10); // Password Hashing [cite: 38]
        const newUser = new User({ name, email, password: hashedPassword, role, employeeId, department });
        await newUser.save();
        res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Login User
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, user: { id: user._id, name: user.name, role: user.role } });
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