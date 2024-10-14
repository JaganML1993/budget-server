const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const Admin = require("../model/admin.model.js");
require('dotenv').config();
const jwt = require('jsonwebtoken');


// Create and Save a new User
exports.register = async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { fullname, email, password } = req.body;
    try {
        const existingUser = await Admin.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                status: "failed",
                data: [],
                message: "It seems you already have an account, please log in instead.",
            });
        }

        // Hash the password before saving it
        const salt = await bcrypt.genSalt(10); // Generate salt with a cost factor of 10
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new Admin({
            fullname,
            email,
            password: hashedPassword, // Save hashed password
        });

        const savedUser = await newUser.save(); // save new user into the database
        const { role, ...user_data } = savedUser._doc;
        res.status(200).json({
            status: "success",
            data: [user_data],
            message:
                "Thank you for registering with us. Your account has been successfully created.",
        });

    } catch (err) {
        res.status(500).json({
            status: "error",
            code: 500,
            data: [],
            message: "Internal Server Error",
        });
    }

    res.end();
};

// Login an existing user
exports.login = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
        // Check if the user exists in the database
        const existingUser = await Admin.findOne({ email });
        if (!existingUser) {
            return res.status(400).json({
                status: 'failed',
                message: 'Invalid email or password.',
            });
        }

        // Compare the entered password with the hashed password in the database
        try {
            const isPasswordValid = await bcrypt.compare(password, existingUser.password);
            if (!isPasswordValid) {
                return res.status(400).json({
                    status: 'failed',
                    message: 'Invalid email or password.',
                });
            }
        } catch (error) {
            console.error('Error comparing passwords:', error);
            return res.status(500).json({
                status: 'error',
                message: 'Internal Server Error during password comparison.',
            });
        }

        // Generate a JWT token if the login is successful
        const token = jwt.sign(
            { id: existingUser._id, email: existingUser.email },
            process.env.JWT_SECRET, // Ensure this is set in your environment
            { expiresIn: null } // Token expiration time
        );

        // Return the token and user data
        const { role, ...user_data } = existingUser._doc;
        res.status(200).json({
            status: 'success',
            token, // Send the token to the client
            data: user_data,
            message: 'Login successful.',
        });

    } catch (err) {
        console.error(err); // Log the error to see what it is
        res.status(500).json({
            status: 'error',
            code: 500,
            message: 'Internal Server Error',
        });
    }
};
