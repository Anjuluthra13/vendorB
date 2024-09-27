const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Razorpay = require('razorpay');
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser');
const vendor = require('./model/vendor');
dotenv.config({ path: './config.env' });

const app = express();
const PORT = 5000;

// Connect to the database
const DB = 'mongodb+srv://Work4You:Work4You@cluster0.iyyiqtc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
mongoose.connect(DB, { useNewUrlParser: true, useUnifiedTopology: true })

mongoose.connect(DB).then(() => {
    console.log("Connected to database successfully");
}).catch((err) => {
    console.log('Database connection failed');
});

// Apply middlewares
app.use(cors());
app.use(express.json());
app.use(cookieParser());
// Vendor Schema and Model
const VendorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    age: { type: String, required: true },
    service: { type: String, required: true },
    phone: { type: Number, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  });
  
  const Vendor = mongoose.model('Vendor', VendorSchema);
  
  // vendorLogin endpoint
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        // Check if a vendor with the given email exists
        const vendor = await Vendor.findOne({ email });
        if (!vendor) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Compare the provided password with the stored hashed password
        const isMatch = await bcrypt.compare(password, vendor.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Return success message and vendor data (excluding sensitive data)
        return res.json({
            message: 'Login successful',
            vendor: {
                id: vendor._id, // Include vendor ID for further requests
                name: vendor.name,
                age: vendor.age,
                service: vendor.service,
                phone: vendor.phone,
                email: vendor.email
            }
        });
    } catch (err) {
        console.error("Error during login:", err);
        return res.status(500).json({ message: 'Server error during login' });
    }
});

  // vendorRegister endpoint
  app.post('/api/register', async (req, res) => {
    const { name, age, service, phone, email, password } = req.body;

    // Validate required fields
    if (!name || !age || !service || !phone || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        // Check for existing vendor
        const existingVendor = await Vendor.findOne({ email });
        if (existingVendor) {
            return res.status(400).json({ message: 'Vendor already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create and save new vendor
        const newVendor = new Vendor({ name, age, service, phone, email, password: hashedPassword });
        await newVendor.save();

        // Send success response
        res.status(201).json({ message: 'Vendor registered successfully' });
    } catch (err) {
        console.error("Error during registration:", err);
        res.status(500).json({ message: 'Server error during registration' });
    }
});


  // Vendor profile endpoint
app.get('/api/profile', async (req, res) => {
    const { email } = req.query;

    if (!email) {
        return res.status(400).json({ message: 'Email is required to fetch profile' });
    }

    try {
        const vendor = await Vendor.findOne({ email });

        if (!vendor) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Exclude the password from the response
        res.json({
            name: vendor.name,
            age: vendor.age,
            service: vendor.service,
            phone: vendor.phone,
            email: vendor.email
        });
    } catch (err) {
        console.error("Error fetching profile:", err);
        res.status(500).json({ message: 'Server error during fetching profile' });
    }
});



// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

//Middelware
// const middleware = (req,res, next) => {
//     console.log(`Hello my Middleware`);
//     next();
// }

// app.get('/', (req, res) => {
//     res.send(`Hello world from the server app.js`);
// });

//app.get('/about', middleware, (req, res) => {
  //  console.log(`Hello my About`);
   // res.send(`Hello About world from the server`);
//});

// app.get('/contact', (req, res) => {
//     res.send(`Hello Contact world from the server`);
// });