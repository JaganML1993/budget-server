const { validationResult } = require('express-validator');
const History = require("../model/history.model.js");

// Create and Save a new Commitment
exports.store = async (req, res) => {
    const errors = validationResult(req);
    // Handle validation errors
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        // Extract data from the request body
        const {
            payFor,
            category,
            payType,
            amount,
            remarks,
            status,
            total
        } = req.body;

        // Create a new Commitment instance
        const newCommitment = new Commitment({
            payFor,
            category,
            payType,
            amount,
            remarks,
            status,
            total
        });

        // Save the new commitment to the database
        const savedCommitment = await newCommitment.save();

        // Send a success response with the saved commitment data
        res.status(201).json({
            status: "success",
            code: 201,
            data: savedCommitment,
            message: "Commitment created successfully",
        });

    } catch (err) {
        // Handle any errors that occur during the save process
        res.status(500).json({
            status: "error",
            code: 500,
            data: [],
            message: "Internal Server Error",
        });
    }

    res.end();
};



