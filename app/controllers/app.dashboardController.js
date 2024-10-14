const { default: mongoose } = require("mongoose");
const Expense = require("../model/expense.model.js"); // Adjust the path to your Expense model

exports.index = async (req, res) => {
    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfToday = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 23, 59, 59);

    const userId = new mongoose.Types.ObjectId(req.query.userId);

    try {
        // Aggregate expenses by day of the month from the start of the month to today
        const dailyExpenses = await Expense.aggregate([
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
                    _id: { $dayOfMonth: "$paidOn" },
                    totalAmount: { $sum: { $toDouble: "$amount" } }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        // Prepare daily totals array with a slot for each day up to today
        const dailyTotals = new Array(currentDate.getDate()).fill(0);
        dailyExpenses.forEach(expense => {
            dailyTotals[expense._id - 1] = expense.totalAmount;
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

        res.status(200).json({ dailyTotals, monthlyCategoryExpenses });
    } catch (err) {
        res.status(500).json({
            status: "error",
            code: 500,
            data: [],
            message: "Internal Server Error",
        });
    }
};

