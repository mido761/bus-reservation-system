const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {type: String, required: false},
    phoneNumber: {type: Number, required: false},
    email: {type: String, required: false},
    password: {type: String, required: false},
    bookedBuses:{
         buses: [{type: Array, required: false}]}
});

module.exports = mongoose.model('User', UserSchema);
