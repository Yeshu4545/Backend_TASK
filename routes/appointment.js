const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const nodemailer = require('nodemailer');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const appointmentRoutes = require('../routes/appointment');

require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

router.post('/', async (req, res) => {
    const { patientId, doctorId, appointmentDate, status   } = req.body;
    try {
        const newAppointment = new Appointment({
            patientId,
            doctorId,
            appointmentDate,
            status: 'pending',
        });
        await newAppointment.save();
         await Doctor.findByIdAndUpdate(doctorId, {
      $pull: { availableSlots: new Date(appointmentDate) }
    });
        
    // Send email confirmation
    const patient = await Patient.findById(patientId);
    const doctor = await Doctor.findById(doctorId);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: patient.email,
      subject: "Appointment Confirmation - Doctor Appointment System",
      text: `Dear ${patient.name},

We are pleased to inform you that your appointment has been successfully booked.

Appointment Details:
- Doctor: Dr. ${doctor.name} (${doctor.specialization})
- Date & Time: ${new Date(appointmentDate).toLocaleString()}
- Status: Pending

If you have any questions or need to reschedule, please contact our support team or reply to this email.

Thank you for choosing our healthcare services.

Best regards,
Doctor Appointment System Team
`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Email failed to send:", error);
        // Optionally, you can return an error response here:
        // return res.status(500).json({ error: "Failed to send confirmation email" });
      } else {
        console.log("Email sent:", info.response);
      }
    });

        res.status(201).json({ newAppointment });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//Get Appointments for Patient
router.get('/patient/:id', async (req, res) => {
    const { patientId } = req.params;
    try {
        const appointments = await Appointment.find({ patientId: req.params.id }).populate('doctorId');
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//Get Appointments for Doctor
router.get('/doctor/:id', async (req, res) => {
    const { doctorId } = req.params;
    try {
        const appointments = await Appointment.find({ doctorId: req.params.id }).populate('patientId');
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//cancel Appointment
router.delete('/:id', async (req, res) => {
    // const { appointmentId } = req.params;
    try {
        const appointment = await Appointment.findByIdAndDelete(req.params.id);
        if (!appointment) {
            return res.status(404).json({ error: 'Appointment not found' });
        }
        res.json({ message: 'Appointment cancelled successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


router.get("/appointments", auth, async (req, res) => {
  const patientId = req.user.id;
  const appointments = await Appointment.find({ patientId });
  res.json(appointments);
});


module.exports = router;