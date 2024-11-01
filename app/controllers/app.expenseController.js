const { validationResult } = require('express-validator');
const Expense = require("../model/expense.model.js");
const ExpenseHistory = require("../model/updateBalance.model.js");

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
            createdBy,
            remarks,
        } = req.body;

        // Access the uploaded file
        const attachment = req.file ? req.file.path : '';

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
    const { category, startDate, endDate, createdBy, page = 1, limit = 10 } = req.query;

    const filter = {};

    // Add createdBy filter if provided
    if (createdBy) {
        filter.createdBy = createdBy;
    }

    // Add category filter if provided
    if (category) {
        filter.category = category;
    }

    // Date validation
    const parsedStartDate = new Date(startDate);
    const parsedEndDate = new Date(endDate);

    if (startDate && endDate && parsedStartDate > parsedEndDate) {
        return res.status(400).json({
            status: "error",
            code: 400,
            message: "Start date cannot be after end date."
        });
    }

    // Add date range filter if both start and end dates are provided
    if (startDate && !isNaN(parsedStartDate.getTime())) {
        filter.paidOn = { ...filter.paidOn, $gte: parsedStartDate };
    }
    if (endDate && !isNaN(parsedEndDate.getTime())) {
        filter.paidOn = { ...filter.paidOn, $lte: parsedEndDate };
    }

    try {
        const pageNumber = Number(page) || 1; // Convert to number
        const totalExpenses = await Expense.countDocuments(filter);
        const expenses = await Expense.find(filter)
            .sort({ createdAt: -1 })
            .skip((pageNumber - 1) * limit)
            .limit(Number(limit));

        // Modify totalAmountFilter to include existing filters and exclude category 7
        const totalAmountFilter = {
            ...filter,
            category: { $ne: 7 }  // Exclude category 7
        };

        // If category is provided, include it in the total amount filter
        if (category) {
            totalAmountFilter.category = category;
        }

        // Fetch all expenses matching the modified totalAmountFilter
        const expensesTotal = await Expense.find(totalAmountFilter);

        const totalAmountSpent = expensesTotal.reduce((total, expense) => {
            const amount = typeof expense.amount === 'object'
                ? parseFloat(expense.amount.toString())
                : parseFloat(expense.amount);
            return total + (isNaN(amount) ? 0 : amount);
        }, 0);

        res.status(200).json({
            status: "success",
            code: 200,
            data: expenses,
            total: totalExpenses,
            totalAmountSpent,
            message: "Expenses retrieved successfully",
            totalPages: Math.ceil(totalExpenses / limit),
            currentPage: pageNumber,
        });
    } catch (err) {
        console.error("Error fetching expenses:", err);
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

exports.delete = async (req, res) => {
    try {
        const { id } = req.params; // Ensure you're getting the ID from req.params

        // Find the expense by ID and delete it
        const deletedExpense = await Expense.findByIdAndDelete(id);

        if (!deletedExpense) {
            return res.status(404).json({
                success: false,
                message: "Expense not found",
            });
        }

        // Optionally, delete related expense histories (if needed)
        await ExpenseHistory.deleteMany({ expenseId: id });

        return res.status(200).json({
            success: true,
            message: "Expense deleted successfully",
            data: deletedExpense,
        });
    } catch (error) {
        console.error("Error deleting expense:", error);
        return res.status(500).json({
            success: false,
            message: "An error occurred while deleting the expense",
        });
    }
};


exports.listUpdateBalance = async (req, res) => {
    const expenseId = req.params.id;

    try {
        // Fetch the expense details
        const expense = await Expense.findById(expenseId);
        if (!expense) {
            return res.status(404).json({
                status: "error",
                code: 404,
                message: "Expense not found",
            });
        }

        // Fetch the update history for this expense
        const history = await ExpenseHistory.find({ expenseId: expenseId });

        res.status(200).json({
            status: "success",
            code: 200,
            data: {
                expense,
                history,
            },
        });
    } catch (err) {
        console.error("Error occurred:", err); // Log the error for debugging
        res.status(500).json({
            status: "error",
            code: 500,
            message: "Internal Server Error",
        });
    }
};

exports.addBalance = async (req, res) => {
    const errors = validationResult(req);

    // Handle validation errors
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const expenseId = req.params.id;
    const { amount, remarks, paidOn } = req.body;

    try {
        // Find the existing expense
        const existingExpense = await Expense.findById(expenseId);
        if (!existingExpense) {
            return res.status(404).json({
                status: "error",
                code: 404,
                message: "Expense not found",
            });
        }

        // Parse and format the amount
        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount)) {
            return res.status(400).json({
                errors: [
                    {
                        msg: "Amount must be a valid number.",
                        param: "amount",
                    },
                ],
            });
        }

        // Update the existing expense's total amount
        existingExpense.amount = (parseFloat(existingExpense.amount) - parsedAmount).toFixed(2);
        await existingExpense.save();

        // Create a history record
        const historyRecord = new ExpenseHistory({
            expenseId: expenseId,
            amount: parsedAmount.toFixed(2),
            remarks: remarks,
            paidOn: new Date(paidOn),
            updatedAt: new Date(),
        });

        await historyRecord.save(); // Save the history record

        res.status(201).json({
            status: "success",
            code: 201,
            data: historyRecord,
            message: "New balance added successfully",
        });
    } catch (err) {
        console.error(err); // Log the error for debugging
        res.status(500).json({
            status: "error",
            code: 500,
            message: "Internal Server Error",
        });
    }
};

exports.updateHistory = async (req, res) => {
    const errors = validationResult(req);

    // Handle validation errors
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const historyId = req.params.historyId;
    const { amount, remarks, paidOn } = req.body;

    try {
        // Find the existing history record
        const existingHistory = await ExpenseHistory.findById(historyId);
        if (!existingHistory) {
            return res.status(404).json({
                status: "error",
                code: 404,
                message: "History record not found",
            });
        }

        // Find the associated expense
        const associatedExpense = await Expense.findById(existingHistory.expenseId);
        if (!associatedExpense) {
            return res.status(404).json({
                status: "error",
                code: 404,
                message: "Associated expense not found",
            });
        }

        let originalAmount = parseFloat(existingHistory.amount);
        let parsedAmount;

        // Update amount if provided
        if (amount) {
            parsedAmount = parseFloat(amount);
            if (isNaN(parsedAmount)) {
                return res.status(400).json({
                    errors: [
                        {
                            msg: "Amount must be a valid number.",
                            param: "amount",
                        },
                    ],
                });
            }

            // Adjust the expense total by the difference between the old and new amount
            associatedExpense.amount = (
                parseFloat(associatedExpense.amount) + (originalAmount - parsedAmount)
            ).toFixed(2);

            // Update history with the new amount
            existingHistory.amount = parsedAmount.toFixed(2);
        }

        // Update other fields if provided
        if (remarks) {
            existingHistory.remarks = remarks;
        }

        if (paidOn) {
            existingHistory.paidOn = new Date(paidOn);
        }

        existingHistory.updatedAt = new Date();

        // Save the updated expense and history
        await associatedExpense.save();
        await existingHistory.save();

        res.status(200).json({
            status: "success",
            code: 200,
            data: existingHistory,
            message: "History record updated successfully",
        });
    } catch (err) {
        console.error(err); // Log the error for debugging
        res.status(500).json({
            status: "error",
            code: 500,
            message: "Internal Server Error",
        });
    }
};


exports.deleteHistory = async (req, res) => {
    const historyId = req.params.id;

    try {
        const deletedHistory = await ExpenseHistory.findByIdAndDelete(historyId);
        if (!deletedHistory) {
            return res.status(404).json({
                status: "error",
                code: 404,
                message: "History record not found",
            });
        }

        res.status(200).json({
            status: "success",
            code: 200,
            message: "History record deleted successfully",
        });
    } catch (err) {
        res.status(500).json({
            status: "error",
            code: 500,
            message: "Internal Server Error",
        });
    }
};






