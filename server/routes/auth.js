const express = require("express");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const User = require("../models/User");

const router = express.Router();

// Signup route
router.post("/signup", async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if user exists
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: "User already exists" });

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Save user
        user = new User({ email, password: hashedPassword });
        await user.save();

        // Send email notification
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "your-email@gmail.com", // replace with your email
                pass: "your-app-password",    // use Gmail App Password
            },
        });

        const mailOptions = {
            from: "your-email@gmail.com",
            to: email,
            subject: "Habit Tracker Registration",
            text: "You have successfully registered for Habit Tracker!",
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error(error);
            } else {
                console.log("Email sent: " + info.response);
            }
        });

        res.json({ msg: "User registered successfully" });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
});

module.exports = router;