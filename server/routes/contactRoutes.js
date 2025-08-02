const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Contact = require('../models/Contact');  // Import the Contact model
const middleware = require("../controllers/middleware");

/**
 * @route GET /contact
 * @description Get all contact messages
 * @access Private - Admin only
 * @returns {Array<Object>} Array of contact messages
 * @throws {500} For internal server errors
 */
router.get('/', middleware.isAuthoraized, async (req, res) => {
  try {
    console.log('Fetching all contact messages...');
    const contacts = await Contact.find();  // Retrieve all contacts
    res.json(contacts);  // Return the list of contacts
  } catch (err) {
    console.error('Error fetching contacts:', err);
    res.status(500).json({ message: 'Error retrieving contact messages' });
  }
});

/**
 * @route POST /contact
 * @description Submit a new contact message
 * @access Private - Authenticated users only
 * @param {Object} req.body
 * @param {string} req.body.name - Name of the sender
 * @param {string} req.body.email - Email of the sender
 * @param {string} req.body.message - Contact message content
 * @returns {Object} The created contact message
 * @throws {500} For internal server errors
 */
router.post('/', middleware.isAuthenticated, async (req, res) => {
  const { name, email, message } = req.body;
  console.log('Received contact message:', req.body); // Log the incoming request data

  try {
    const newContact = new Contact({
      name,
      email,
      message,
    });

    console.log('Saving new contact message:', newContact); // Log the contact message object
    await newContact.save();  // Save the new contact message to the database

    res.status(201).json(newContact);  // Return the newly created contact message
  } catch (err) {
    console.error('Error saving contact message:', err);
    res.status(500).json({ message: 'Error saving contact message' });
  }
});

/**
 * @route DELETE /contact/:id
 * @description Delete a specific contact message
 * @access Private - Admin only
 * @param {string} req.params.id - ID of the contact message to delete
 * @returns {Object} Success message
 * @throws {400} If ID format is invalid
 * @throws {404} If contact message not found
 * @throws {500} For internal server errors
 */
router.delete('/:id', middleware.isAuthoraized, async (req, res) => {
  const contactId = req.params.id;
  console.log('Deleting contact message with ID:', contactId);

  // Check if the ID is valid MongoDB ObjectId format
  if (!mongoose.Types.ObjectId.isValid(contactId)) {
    return res.status(400).json({ message: 'Invalid ID format' });
  }

  try {
    const deletedContact = await Contact.findByIdAndDelete(contactId);  // Delete the contact by ID

    if (!deletedContact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    res.status(200).json({ message: 'Contact deleted successfully' });  // Success message
  } catch (err) {
    console.error('Error deleting contact message:', err);
    res.status(500).json({ message: 'Error deleting contact message' });
  }
});

module.exports = router;
