const { validationResult } = require("express-validator");
const HouseSaving = require("../model/houseSaving.model.js");

const mongoose = require("mongoose");

exports.index = async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;
  const skip = (page - 1) * limit;
  let { createdBy } = req.query;

  try {
    const query = {};

    if (createdBy) {
      try {
        createdBy = new mongoose.Types.ObjectId(createdBy);
        query.createdBy = createdBy;
      } catch (err) {
        return res.status(400).json({
          status: "error",
          message: "Invalid createdBy ID",
        });
      }
    }

    const Savings = await HouseSaving.find(query).skip(skip).limit(limit);
    const totalDocuments = await HouseSaving.countDocuments(query);

    const totalAmountResult = await HouseSaving.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalAmount: {
            $sum: { $toDouble: "$amount" },
          },
        },
      },
    ]);

    const totalAmount = totalAmountResult[0]?.totalAmount || 0;

    res.status(200).json({
      status: "success",
      code: 200,
      data: Savings,
      totalPages: Math.ceil(totalDocuments / limit),
      totalAmountSaved: totalAmount,
      message: "House Savings retrieved successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      code: 500,
      data: [],
      message: "Internal Server Error",
    });
  }
};

exports.store = async (req, res) => {
  // Handle validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Extract data from request body
    const { amount, date, saving_type, remarks, createdBy } = req.body;

    // Create a new HouseSaving instance
    const newSaving = new HouseSaving({
      amount,
      date,
      saving_type,
      remarks,
      createdBy,
    });

    // Save to DB
    const savedSaving = await newSaving.save();

    // Send a success response
    return res.status(201).json({
      status: "success",
      code: 201,
      data: savedSaving,
      message: "House Saving created successfully",
    });
  } catch (err) {
    console.error("HouseSaving Store Error:", err);
    return res.status(500).json({
      status: "error",
      code: 500,
      data: [],
      message: "Internal Server Error",
    });
  }
};
