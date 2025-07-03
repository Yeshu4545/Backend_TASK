const express = require('express');
const router = express.Router();
const Doctor = require('../models/Doctor');

router.post('/register', async (req, res) => {
    const { name, email, password, specialization } = req.body;
    try {
        const existing = await Doctor.findOne({ email });
        if (existing) {
            return res.status(400).json({ message: 'Email already registered' });
        }
        const newDoctor = new Doctor({
            name,
            email,
            password, 
            specialization
        });
        await newDoctor.save();
        res.status(201).json({ newDoctor });
    } catch (error) {
        console.error('Error registering doctor:', error);
        res.status(500).json({ error: error.message });
    }
});

router.post('/login', async (req, res) => {
    let { email, password } = req.body;
    email = email.trim().toLowerCase(); 
    try {
        const doctor = await Doctor.findOne({ email });
        if (!doctor) {
            return res.status(400).json({ message: 'Email is not correct' });
        }
       
        const isMatch = doctor.password === password;
        if (!isMatch) {
            return res.status(400).json({ message: 'Passwords doesnt match' });
        }
        const token = doctor.generateAuthToken();
        res.json({ token, doctor: { id: doctor._id, name: doctor.name, email: doctor.email, specialization: doctor.specialization } });
    } catch (error) {   
        console.error('Error logging in doctor:', error);
        res.status(500).json({ error: error.message });
    }
});

router.post('/availability', async (req, res) => {
    const { name, specialization, availableSlots } = req.body; 
    try {
        const newDoctor = new Doctor({
            name,
            specialization,
            availableSlots 
        });
        await newDoctor.save();
        res.status(201).json({ newDoctor });
    } catch (error) {
        console.error('Error registering doctor:', error);
        res.status(500).json({ error: error.message });
    } 
});

router.patch('/:id/availability', async (req, res) => {
    const { availableSlots } = req.body; 
    try {
        const doctor = await Doctor.findByIdAndUpdate(req.params.id, { availableSlots }, { new: true }); // fixed typo
        if (!doctor) {
            return res.status(404).json({ error: 'Doctor not found' });
        }
        res.json({ doctor });
    } catch (error) {
        console.error('Error updating doctor availability:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;