const { default: mongoose } = require("mongoose");
const Expense = require("../model/expense.model.js");
const Commitment = require("../model/commitment.model.js");

exports.index = async (req, res) => {
    const { startDate, endDate } = req.query;
    const userId = new mongoose.Types.ObjectId(req.query.userId);

    // Parse start and end dates; default to current month if not provided
    const startOfMonth = new Date(startDate || new Date(new Date().getFullYear(), new Date().getMonth(), 1));
    const endOfToday = new Date(endDate || new Date()); // Default to today if endDate is not provided

    // Ensure endOfToday does not go beyond the current date
    const currentDate = new Date();
    endOfToday.setHours(23, 59, 59, 999); // Set to end of today

    if (endOfToday > currentDate) {
        endOfToday.setTime(currentDate.getTime()); // Set to current date if end date is in the future
    }

    try {
        // Aggregate expenses by day of the month from the start of the selected date range
        const dailyExpenses = await Expense.aggregate([
            {
                $match: {
                    createdBy: userId,
                    paidOn: {
                        $gte: startOfMonth,
                        $lte: endOfToday
                    },
                    category: { $ne: 7 }
                }
            },
            {
                $group: {
                    _id: { $dayOfMonth: "$paidOn" },
                    totalAmount: { $sum: { $toDouble: "$amount" } }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        // Prepare daily totals array with a slot for each day of the month
        const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
        const dailyTotals = new Array(daysInMonth).fill(0);

        dailyExpenses.forEach(expense => {
            // Only populate the totals for days that have actual expenses
            if (expense._id - 1 < dailyTotals.length) {
                dailyTotals[expense._id - 1] = expense.totalAmount;
            }
        });

        // Aggregate expenses by category for the pie chart
        const monthlyCategoryExpenses = await Expense.aggregate([
            {
                $match: {
                    createdBy: userId,
                    paidOn: {
                        $gte: startOfMonth,
                        $lte: endOfToday
                    }
                }
            },
            {
                $group: {
                    _id: "$category", // Group by category
                    totalAmount: { $sum: { $toDouble: "$amount" } }
                }
            }
        ]);

        // Aggregate total commitments, total paid, and total pending amounts grouped by payFor
        const commitmentAggregates = await Commitment.aggregate([
            {
                $match: {
                    createdBy: userId, // Match documents created by the user
                }
            },
            {
                $group: {
                    _id: "$payFor", // Group by payFor
                    totalPaid: { $sum: { $toDouble: "$paidAmount" } }, // Total paid amount from paidAmount
                    totalPending: { $sum: { $toDouble: "$balanceAmount" } } // Total pending amount from balanceAmount
                }
            },
            {
                $project: {
                    payFor: "$_id", // Include the payFor field
                    totalPaid: 1,
                    totalPending: 1,
                    _id: 0 // Exclude the original _id field
                }
            },
            {
                $match: {
                    // totalPaid: { $gt: 0 }, // Ensure totalPaid is greater than 0
                    totalPending: { $gt: 0 } // Ensure totalPending is greater than 0
                }
            }
        ]);

        // Aggregate total expenses by month
        const monthlyExpenses = await Expense.aggregate([
            {
                $match: {
                    createdBy: userId,
                    category: { $ne: 7 },
                },
            },
            {
                $group: {
                    _id: { $month: "$paidOn" }, // Group by month
                    totalAmount: { $sum: { $toDouble: "$amount" } },
                },
            },
            {
                $sort: { _id: 1 }, // Sort by month
            },
        ]);

        // Prepare monthly totals array
        const monthlyTotals = new Array(12).fill(0); // 12 months
        monthlyExpenses.forEach(expense => {
            monthlyTotals[expense._id - 1] = expense.totalAmount; // Populate the array
        });

        res.status(200).json({
            dailyTotals,
            monthlyCategoryExpenses,
            commitments: commitmentAggregates,
            monthlyTotals,
        });
    } catch (err) {
        console.error(err); // Log the error for debugging
        res.status(500).json({
            status: "error",
            code: 500,
            data: [],
            message: "Internal Server Error",
        });
    }
};

