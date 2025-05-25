const { default: mongoose } = require("mongoose");
const Expense = require("../model/expense.model.js");
const Commitment = require("../model/commitment.model.js");

exports.topCard = async (req, res) => {
  try {
    let userId = req.user?._id || req.body.userId || req.query.userId;
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid User ID" });
    }
    userId = new mongoose.Types.ObjectId(userId);

    // Total Savings
    const savingsResult = await Expense.aggregate([
      { $match: { createdBy: userId } },
      { $group: { _id: null, totalSavings: { $sum: "$amount" } } },
    ]);
    const totalSavings =
      savingsResult.length > 0 ? savingsResult[0].totalSavings : 0;

    // Commitment per Month (category: 1)
    const commitmentResult = await Commitment.aggregate([
      {
        $match: {
          createdBy: userId,
          payType: 1,
          category: 1,
        },
      },
      {
        $group: {
          _id: null,
          commitments: { $sum: "$emiAmount" },
        },
      },
    ]);
    const commitments =
      commitmentResult.length > 0 ? commitmentResult[0].commitments : 0;

    // Commitment Full (category: 2)
    const commitmentFullResult = await Commitment.aggregate([
      {
        $match: {
          createdBy: userId,
          payType: 1,
          category: 2,
        },
      },
      {
        $group: {
          _id: null,
          commitmentsFull: { $sum: "$emiAmount" },
        },
      },
    ]);
    const commitmentsFull =
      commitmentFullResult.length > 0
        ? commitmentFullResult[0].commitmentsFull
        : 0;

    // Return all values
    return res.json({ totalSavings, commitments, commitmentsFull });
  } catch (error) {
    console.error("Error fetching top card data:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.upcomingPayments = async (req, res) => {
  try {
    // Get userId from req.user, req.body, or req.query as per your auth setup
    let userId = req.user?._id || req.body.userId || req.query.userId;
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    if (!(userId instanceof mongoose.Types.ObjectId)) {
      userId = new mongoose.Types.ObjectId(userId);
    }

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    const today = new Date().getDate();

    const upcomingPayments = await Commitment.aggregate([
      {
        $match: {
          createdBy: userId,
          status: 1, // Ongoing status
          category: 1, // EMI category
        },
      },
      {
        $lookup: {
          from: "commitmenthistories",
          localField: "_id",
          foreignField: "commitmentId",
          as: "commitmentHistories",
        },
      },
      {
        $addFields: {
          commitmentHistories: {
            $filter: {
              input: "$commitmentHistories",
              as: "history",
              cond: {
                $and: [
                  { $eq: [{ $year: "$$history.paidDate" }, currentYear] },
                  { $eq: [{ $month: "$$history.paidDate" }, currentMonth + 1] }, // month is 1-based
                ],
              },
            },
          },
          dueInDays: {
            $subtract: ["$dueDate", today], // difference between dueDate and today's day
          },
        },
      },
      {
        $match: {
          "commitmentHistories.0": { $exists: false }, // ensures no entries in current month
        },
      },
      {
        $sort: {
          dueInDays: 1, // Sort by dueInDays in ascending order
        },
      },
    ]);

    // Send the result as JSON
    return res.json(upcomingPayments);
  } catch (error) {
    console.error("Error fetching upcoming payments:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// GET /dashboard/savings-by-month?userId=...&from=YYYY-MM-DD&to=YYYY-MM-DD
exports.savingsByMonth = async (req, res) => {
  try {
    const userId = req.user?._id || req.query.userId || req.body.userId;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid or missing userId" });
    }

    // Optional date range filtering
    const { from, to } = req.query;
    const match = { createdBy: new mongoose.Types.ObjectId(userId) };
    if (from || to) {
      match.createdAt = {};
      if (from) match.createdAt.$gte = new Date(from);
      if (to) match.createdAt.$lte = new Date(to);
    }

    // Group by year and month, sum amount
    const data = await Expense.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          total: { $sum: "$amount" },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
    ]);

    // Total savings (in filter)
    const totalSavings = data.reduce((acc, cur) => acc + cur.total, 0);

    // Format for frontend
    const result = data.map((item) => ({
      month: `${item._id.year}-${String(item._id.month).padStart(2, "0")}`,
      total: item.total,
    }));

    return res.json({ monthly: result, totalSavings });
  } catch (error) {
    console.error("savingsByMonth error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
