const mongoose = require("mongoose");
const { validationResult } = require("express-validator");
const Commitment = require("../model/commitment.model.js");
const User = require("../model/admin.model.js");
const CommitmentHistory = require("../model/commitmentHistory.model.js");

const recalculateCommitment = async (commitmentId) => {
  // Fetch all histories for the specific commitmentId
  const commitmentHistories = await CommitmentHistory.find({ commitmentId });

  const paid = commitmentHistories.length; // Total number of paid EMIs
  const paidAmount = commitmentHistories.reduce((sum, history) => {
    return sum + parseFloat(history.amount.toString());
  }, 0); // Total paid amount

  const commitment = await Commitment.findById(commitmentId); // Fetch the commitment
  const totalAmount =
    commitment.totalEmi * parseFloat(commitment.emiAmount.toString()); // Total amount to be paid
  const balanceAmount = totalAmount - paidAmount; // Remaining balance
  const pending = commitment.totalEmi - paid; // Pending EMI count

  // Update the commitment fields
  commitment.balanceAmount = balanceAmount;
  commitment.paidAmount = paidAmount;
  commitment.pending = pending;
  commitment.paid = paid;

  await commitment.save(); // Save the updated commitment
};

// Create and Save a new Commitment
exports.store = async (req, res) => {
  // Handle validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Extract data from the request body
    const {
      payFor,
      category,
      payType,
      totalEmi,
      emiAmount,
      dueDate,
      status,
      remarks,
      createdBy, // Assuming createdBy is sent in the body
    } = req.body;

    // Handle file uploads
    const attachment = req.file ? req.file.path : "";
    const paidAmount = 0.0;
    let balanceAmount = 0.0;
    let pending = 0;
    let paid = 0;

    if (category == 2) {
      paid = 0;
      pending = 1;
      balanceAmount = emiAmount;
    }

    // Create a new Commitment instance
    const newCommitment = new Commitment({
      payFor,
      category,
      payType,
      totalEmi,
      emiAmount,
      status,
      dueDate,
      remarks,
      attachment,
      createdBy,
      balanceAmount,
      paidAmount,
      pending,
      paid,
    });

    // Save the new commitment to the database
    const savedCommitment = await newCommitment.save();

    // Send a success response with the saved commitment data
    return res.status(201).json({
      status: "success",
      code: 201,
      data: savedCommitment,
      message: "Commitment created successfully",
    });
  } catch (err) {
    // Handle any errors that occur during the save process
    return res.status(500).json({
      status: "error",
      code: 500,
      data: [],
      message: "Internal Server Error",
    });
  }
};

// Fetch and return all Commitments
exports.index = async (req, res) => {
  const limit = parseInt(req.query.limit) || 10; // Items per page
  const page = parseInt(req.query.page) || 1; // Current page
  const skip = (page - 1) * limit; // Calculate the number of documents to skip
  const createdBy = req.query.createdBy;

  try {
    const query = {};
    if (createdBy) {
      query.createdBy = createdBy;
    }

    // Fetch paginated data
    const commitments = await Commitment.find(query).skip(skip).limit(limit);

    // Count only documents matching the filter
    const totalCommitments = await Commitment.countDocuments(query);

    res.status(200).json({
      status: "success",
      code: 200,
      data: commitments,
      totalPages: Math.ceil(totalCommitments / limit),
      message: "Commitments retrieved successfully",
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

// Fetch and return details of a specific Commitment
exports.show = async (req, res) => {
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
    return res.status(200).json({
      status: "success",
      code: 200,
      data: commitment,
      message: "Commitment details retrieved successfully",
    });
  } catch (err) {
    // Handle any errors during the fetch process
    console.error(err); // Log the error for debugging
    return res.status(500).json({
      status: "error",
      code: 500,
      data: [],
      message: "Internal Server Error",
    });
  }
};

// Update a specific Commitment
exports.update = async (req, res) => {
  // Handle validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id } = req.params;

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

    // Extract updated data from the request body
    const {
      payFor,
      category,
      payType,
      totalEmi,
      emiAmount,
      status,
      dueDate,
      remarks,
    } = req.body;

    const attachment = req.file ? req.file.path : commitment.attachment; // Keep existing attachment if none is uploaded

    // Update commitment fields with new values from the request
    commitment.payFor = payFor;
    commitment.category = category;
    commitment.payType = payType;
    commitment.totalEmi = totalEmi;
    commitment.emiAmount = emiAmount;
    commitment.status = status;
    commitment.remarks = remarks;
    commitment.attachment = attachment;
    commitment.dueDate = dueDate;

    // Set paid and pending based on the category
    if (category == 2) {
      commitment.paid = 0;
      commitment.pending = 1;
      commitment.balanceAmount = emiAmount;
      commitment.paidAmount = 0.0;
    } else {
      commitment.paid = commitment.paid;
      commitment.pending = commitment.pending;
      commitment.balanceAmount = commitment.balanceAmount;
      commitment.paidAmount = commitment.paidAmount;
    }

    // Save the updated commitment back to the database
    const updatedCommitment = await commitment.save();

    // Send a success response with the updated commitment data
    return res.status(200).json({
      status: "success",
      code: 200,
      data: updatedCommitment,
      message: "Commitment updated successfully",
    });
  } catch (err) {
    console.error("Error updating commitment:", err);
    // Handle any errors that occur during the update process
    return res.status(500).json({
      status: "error",
      code: 500,
      data: [],
      message: "Internal Server Error",
    });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params; // Extract the commitment ID from params
    const { userId } = req.body; // Extract userId from request body

    // Find user by ID and check their role
    const user = await User.findById(userId);
    if (!user || user.role !== 1) {
      return res.status(403).json({
        status: "error",
        code: 403,
        message: "You do not have permission to delete this commitment.",
      });
    }

    // Find the commitment by ID
    const commitment = await Commitment.findById(id);
    if (!commitment) {
      return res.status(404).json({
        status: "error",
        code: 404,
        message: "Commitment not found.",
      });
    }

    // Perform the deletion
    await Commitment.findByIdAndDelete(id);

    // Respond with success
    res.status(200).json({
      status: "success",
      code: 200,
      message: "Commitment deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      code: 500,
      message: "Internal Server Error.",
    });
  }
};

exports.indexHistory = async (req, res) => {
  const commitmentId = req.params.id; // Get the commitment ID from the request parameters
  const limit = parseInt(req.query.limit) || 10; // Items per page
  const page = parseInt(req.query.page) || 1; // Current page
  const skip = (page - 1) * limit; // Calculate the number of documents to skip

  try {
    // Fetch the history based on the commitment ID with pagination
    const history = await CommitmentHistory.find({ commitmentId }) // Adjust the query according to your schema
    .sort({ currentEmi: -1 })  
    .skip(skip)
      .limit(limit); // Limit the results

    // Total count of history documents for the given commitmentId
    const totalHistoryCount = await CommitmentHistory.countDocuments({
      commitmentId,
    });

    if (!history || history.length === 0) {
      return res
        .status(404)
        .json({ message: "No history found for this commitment." });
    }

    res.status(200).json({
      message: "History fetched successfully.",
      data: history, // Return the fetched history data
      totalItems: totalHistoryCount, // Total number of history records for this commitment
      totalPages: Math.ceil(totalHistoryCount / limit), // Total number of pages
      currentPage: page, // Current page number
    });
  } catch (error) {
    console.error("Error fetching history:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.storeHistory = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { commitmentId, amount, currentEmi, paidDate, remarks } = req.body;

  try {
    // Fetch the commitment by ID
    const commitment = await Commitment.findById(commitmentId);
    if (!commitment) {
      return res.status(404).json({ message: "Commitment not found" });
    }

    // Create a new CommitmentHistory instance
    const attachment = req.file ? req.file.path : null; // Handle file path gracefully
    const commitmentHistory = new CommitmentHistory({
      commitmentId: commitment._id,
      amount: amount,
      currentEmi: currentEmi,
      paidDate: paidDate ? new Date(paidDate) : new Date(), // Ensure date is handled correctly
      remarks: remarks,
      attachment: attachment,
    });

    // Save the commitment history
    await commitmentHistory.save();

    // Recalculate the commitment totals
    await recalculateCommitment(commitmentId);

    // Respond with success message
    res.status(201).json({
      message: "Commitment history stored successfully!",
      data: commitmentHistory,
    });
  } catch (error) {
    console.error("Error storing commitment history:", error);
    res.status(500).json({
      message: "Failed to store commitment history.",
      error: error.message,
    });
  }
};

exports.showHistory = async (req, res) => {
  try {
    const { id } = req.params; // Extract the commitment ID from request parameters

    // Find commitment by ID
    const commitment = await CommitmentHistory.findById(id);

    // Check if the commitment exists
    if (!commitment) {
      return res.status(404).json({
        status: "error",
        code: 404,
        data: [],
        message: "Commitment history not found",
      });
    }

    // Send success response with the commitment details
    return res.status(200).json({
      status: "success",
      code: 200,
      data: commitment,
      message: "Commitment history details retrieved successfully",
    });
  } catch (err) {
    // Handle any errors during the fetch process
    console.error(err); // Log the error for debugging
    return res.status(500).json({
      status: "error",
      code: 500,
      data: [],
      message: "Internal Server Error",
    });
  }
};

exports.updateHistory = async (req, res) => {
  try {
    const { id } = req.params; // Extract the commitment history ID from request parameters
    const { amount, currentEmi, paidDate, remarks } = req.body; // Get the data from the request body

    // Find the commitment history by ID
    const commitmentHistory = await CommitmentHistory.findById(id);

    // Check if the commitment history exists
    if (!commitmentHistory) {
      return res.status(404).json({
        status: "error",
        code: 404,
        data: [],
        message: "Commitment history not found",
      });
    }

    // Store the commitmentId for recalculation
    const commitmentId = commitmentHistory.commitmentId;

    // Update the commitment history with new values
    commitmentHistory.amount = amount;
    commitmentHistory.currentEmi = currentEmi;
    commitmentHistory.paidDate = paidDate ? new Date(paidDate) : new Date();
    commitmentHistory.remarks = remarks;

    // Handle attachment (if provided)
    if (req.file) {
      commitmentHistory.attachment = req.file.path; // Save the path of the uploaded file
    }

    // Save the updated commitment history
    await commitmentHistory.save();

    // Recalculate the commitment totals
    await recalculateCommitment(commitmentId);

    // Send success response
    return res.status(200).json({
      status: "success",
      code: 200,
      data: commitmentHistory,
      message: "Commitment history updated successfully",
    });
  } catch (err) {
    console.error(err); // Log the error for debugging
    return res.status(500).json({
      status: "error",
      code: 500,
      data: [],
      message: "Internal Server Error",
    });
  }
};

exports.deleteHistory = async (req, res) => {
  const { id } = req.params; // Extract ID from request parameters

  try {
    // Attempt to find and delete the record
    const deletedHistory = await CommitmentHistory.findByIdAndDelete(id);

    // Check if the record was found and deleted
    if (!deletedHistory) {
      return res.status(404).json({
        success: false,
        message: "Commitment history not found.",
      });
    }

    // Store the commitmentId for recalculation
    const commitmentId = deletedHistory.commitmentId;

    // Recalculate the commitment totals
    await recalculateCommitment(commitmentId);

    // Respond with a success message
    return res.status(200).json({
      success: true,
      message: "Commitment history deleted successfully.",
      data: deletedHistory, // Optional: send back the deleted record
    });
  } catch (error) {
    console.error("Error deleting commitment history:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while deleting commitment history.",
      error: error.message, // Optional: send back the error message
    });
  }
};
