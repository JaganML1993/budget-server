const { validationResult } = require('express-validator');
const Commitment = require("../model/commitment.model.js");

// Create and Save a new Commitment
exports.store = async (req, res) => {
    const errors = validationResult(req);
    console.log(errors);
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

        console.log(req.body);

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

// Fetch and return all Commitments
exports.index = async (req, res) => {
    try {
        // Fetch all commitments from the database
        const commitments = await Commitment.find();

        // Send a success response with the list of commitments
        res.status(200).json({
            status: "success",
            code: 200,
            data: commitments,
            message: "Commitments retrieved successfully",
        });

    } catch (err) {
        // Handle any errors that occur during the fetch process
        res.status(500).json({
            status: "error",
            code: 500,
            data: [],
            message: "Internal Server Error",
        });
    }

    res.end();
};

// Fetch and return details of a specific Commitment
exports.details = async (req, res) => {
    try {
        const { id } = req.params; // Extract the commitment ID from request parameters

        // Find commitment by ID
        const commitment = await Commitment.findById(id);

        // Check if the commitment exists
        if (!commitment) {
            return res.status(404).json({
                status: "error",
                code: 404,
                data: [],
                message: "Commitment not found",
            });
        }

        // Send success response with the commitment details
        res.status(200).json({
            status: "success",
            code: 200,
            data: commitment,
            message: "Commitment details retrieved successfully",
        });

    } catch (err) {
        // Handle any errors during the fetch process
        res.status(500).json({
            status: "error",
            code: 500,
            data: [],
            message: "Internal Server Error",
        });
    }

    res.end();
};

// Update a specific Commitment
exports.update = async (req, res) => {
    const errors = validationResult(req);

    // Handle validation errors
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { id } = req.params; // Extract the commitment ID from request parameters

        // Find the existing commitment by ID
        const commitment = await Commitment.findById(id);

        // Check if the commitment exists
        if (!commitment) {
            return res.status(404).json({
                status: "error",
                code: 404,
                data: [],
                message: "Commitment not found",
            });
        }

        // Update the commitment fields with the new data from the request body
        const {
            payFor,
            category,
            payType,
            amount,
            remarks,
            status,
            total
        } = req.body;

        // Assign the new values to the commitment
        commitment.payFor = payFor;
        commitment.category = category;
        commitment.payType = payType;
        commitment.amount = amount;
        commitment.remarks = remarks;
        commitment.status = status;
        commitment.total = total;

        // Save the updated commitment to the database
        const updatedCommitment = await commitment.save();

        // Send a success response with the updated commitment data
        res.status(200).json({
            status: "success",
            code: 200,
            data: updatedCommitment,
            message: "Commitment updated successfully",
        });

    } catch (err) {
        // Handle any errors that occur during the update process
        res.status(500).json({
            status: "error",
            code: 500,
            data: [],
            message: "Internal Server Error",
        });
    }

    res.end();
};

