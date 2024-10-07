const { validationResult } = require('express-validator');
const Expense = require("../model/expense.model.js");

// Create and Save a new Expense
exports.store = async (req, res) => {
    const errors = validationResult(req);

    // Handle validation errors
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        // Extract data from the request body
        const {
            name,
            amount,
            category,
            paidOn,
            // createdBy,
            remarks,
        } = req.body;

        // Access the uploaded file
        const attachment = req.file ? req.file.path : '';
        const createdBy = '66f10257d60426f399fae814';

        // Create a new Expense instance
        const newExpense = new Expense({
            name,
            amount,
            category,
            paidOn,
            createdBy,
            remarks,
            attachment
        });

        // Save the new expense to the database
        const savedExpense = await newExpense.save();

        // Send a success response with the saved expense data
        res.status(201).json({
            status: "success",
            code: 201,
            data: savedExpense,
            message: "Expense created successfully",
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
};

exports.index = async (req, res) => {
    const { category, startDate, endDate } = req.query; // Destructure category and date filters from query params

    // Build a filter object
    const filter = {};

    // Add category filter if provided
    if (category) {
        filter.category = category;
    }

    // Add date range filter if both start and end dates are provided
    if (startDate && endDate) {
        filter.paidOn = {
            $gte: new Date(startDate), // Start date (inclusive)
            $lte: new Date(endDate),   // End date (inclusive)
        };
    } else if (startDate) {
        filter.paidOn = { $gte: new Date(startDate) }; // Only start date provided
    } else if (endDate) {
        filter.paidOn = { $lte: new Date(endDate) }; // Only end date provided
    }

    try {
        // Fetch expenses based on filters
        const expenses = await Expense.find(filter);

        // Send a success response with the retrieved expenses
        res.status(200).json({
            status: "success",
            code: 200,
            data: expenses,
            message: "Expenses retrieved successfully",
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
};

exports.show = async (req, res) => {
    try {
        const expenseId = req.params.id;
        const expense = await Expense.findById(expenseId);

        if (!expense) {
            return res.status(404).json({
                status: "error",
                code: 404,
                message: "Expense not found",
            });
        }

        res.status(200).json({
            status: "success",
            code: 200,
            data: expense,
            message: "Expense retrieved successfully",
        });
    } catch (err) {
        res.status(500).json({
            status: "error",
            code: 500,
            data: [],
            message: "Internal Server Error",
        });
    }
};

// Update an existing expense by ID
exports.update = async (req, res) => {
    const errors = validationResult(req);

    // Handle validation errors
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const expenseId = req.params.id;
        const updatedData = req.body;

        // Handle file upload if it exists
        if (req.file) {
            updatedData.attachment = req.file.path; // Replace the old attachment
        }

        const updatedExpense = await Expense.findByIdAndUpdate(expenseId, updatedData, { new: true });

        if (!updatedExpense) {
            return res.status(404).json({
                status: "error",
                code: 404,
                message: "Expense not found",
            });
        }

        res.status(200).json({
            status: "success",
            code: 200,
            data: updatedExpense,
            message: "Expense updated successfully",
        });
    } catch (err) {
        res.status(500).json({
            status: "error",
            code: 500,
            data: [],
            message: "Internal Server Error",
        });
    }
};
