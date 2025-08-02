const mongoose = require('mongoose');

/**
 * @typedef {Object} Contact
 * @property {string} name - Name of the person submitting the contact form
 * @property {string} email - Email address for correspondence
 * @property {string} message - The contact message/inquiry
 */

/**
 * Mongoose schema for Contact model
 * Used to store user inquiries and contact form submissions
 * @type {mongoose.Schema<Contact>}
 */
const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
});

module.exports = mongoose.model('Contact', contactSchema);
