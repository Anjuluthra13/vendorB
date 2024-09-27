// const mongoose = require('mongoose');

// // Define the schema for the Vendor
// const vendorSchema = new mongoose.Schema({
//     name: {
//         type: String,
//         required: true,
//     },
//     age: {
//         type: Number,
//         required: true,
//     },
//     service: {
//         type: String,
//         required: true,
//         enum: ['Driver', 'HomeMaid', 'Electrician', 'Cleaning', 'Babysitter'], // Enum for service types
//     },
//     phone: {
//         type: String,
//         required: true,
//         unique: true, // Ensure phone numbers are unique
//     },
//     email: {
//         type: String,
//         required: true,
//         unique: true, // Ensure emails are unique
//         lowercase: true, // Save email in lowercase
//     },
//     password: {
//         type: String,
//         required: true,
//     },
// }, { timestamps: true }); // Automatically add createdAt and updatedAt fields

// // Create the model from the schema
// const Vendor = mongoose.model('Vendor', vendorSchema);

// // Export the model
// module.exports = Vendor;
