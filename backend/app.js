const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Razorpay = require('razorpay'); // Unused import, can be removed if not needed
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser');
const vendor = require('./model/vendor'); // Ensure this model file exists
dotenv.config({ path: './config.env' });

const app = express();
const PORT = 5000;

// Connect to the database
const DB = process.env.DB_URI; // Use an environment variable for the database URI
mongoose.connect(DB, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("Connected to database successfully");
    })
    .catch((err) => {
        console.log('Database connection failed', err);
    });

// CORS configuration to allow your frontend
const corsOptions = {
    origin: 'https://vendor-f.vercel.app', // Your frontend URL
    credentials: true, // Allow credentials such as cookies, auth headers
    optionsSuccessStatus: 200
};

// Apply middlewares
app.use(cors(corsOptions)); // CORS with specific origin
app.use(express.json()); // Middleware to parse JSON requests
app.use(cookieParser()); // Middleware to parse cookies

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

// Vendor Login endpoint
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        const vendor = await Vendor.findOne({ email });
        if (!vendor) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, vendor.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        return res.json({
            message: 'Login successful',
            vendor: {
                id: vendor._id,
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

// Vendor Register endpoint
app.post('/api/register', async (req, res) => {
    const { name, age, service, phone, email, password } = req.body;

    // Validate inputs
    if (!name || !age || !service || !phone || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        // Check if the vendor already exists
        const existingVendor = await Vendor.findOne({ email });
        if (existingVendor) {
            return res.status(400).json({ message: 'Vendor already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new vendor instance
        const newVendor = new Vendor({ name, age, service, phone, email, password: hashedPassword });
        await newVendor.save();

        return res.status(201).json({ message: 'Vendor registered successfully' });
    } catch (err) {
        console.error("Error during registration:", err);
        return res.status(500).json({ message: 'Server error during registration' });
    }
});

// Vendor Profile endpoint
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

        res.json({
            name: vendor.name,
            age: vendor.age,
            service: vendor.service,
            phone: vendor.phone,
            email: vendor.email
        });
    } catch (err) {
        console.error("Error fetching profile:", err);
        return res.status(500).json({ message: 'Server error during fetching profile' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
