const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Patient = require("../models/Patient");

//Register
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existing = await Patient.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    // save new patient
    const newPatient = new Patient({
      name,
      email: email,
      password: hashedPassword,
    });
    await newPatient.save();
    res.status(201).json({ newPatient });
  } catch (err) {
    console.error("Error registering patient:", err);
    res.status(500).json({ error: err.message });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const patient = await Patient.findOne({ email });
    if (!patient) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, patient.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: "JWT_SECRET environment variable is not set" });
    }

    const token = jwt.sign(
      { id: patient._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token, patient: { id: patient._id, name: patient.name, email: patient.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
