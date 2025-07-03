const mongoose = require('mongoose');

const DoctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true }, 
  password: { type: String, required: true }, 
  specialization: { type: String, required: true },
  availableSlots: { type: [String], required: false }, 
});

// Dummy token generator for demo
DoctorSchema.methods.generateAuthToken = function() {
  return 'dummy-token-' + this._id;
};

module.exports = mongoose.model('Doctor', DoctorSchema);