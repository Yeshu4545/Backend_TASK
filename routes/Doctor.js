const express = require('express');
const router = express.Router();
const Doctor = require('../models/Doctor');

router.post('/availability', async (req, res) => {
    const {name, specialization, avaliableSlots} = req.body;
    try {
        const newDoctor = new Doctor({
            name,
            specialization,
            avaliableSlots
        });
        await newDoctor.save();
        res.status(201).json({ newDoctor });
    } catch (error) {
        console.error('Error registering doctor:', error);
        res.status(500).json({ error: error.message });
    } 
});

router.patch('/:id/availability', async (req, res) => {
    // const { id } = req.params;
    const { avaliableSlots } = req.body;
    try {
        const doctor = await Doctor.findByIdAndUpdate(req.params.id, { avaliableSlots }, { new: true });
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