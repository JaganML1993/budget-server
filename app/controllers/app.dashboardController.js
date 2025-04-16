const { default: mongoose } = require("mongoose");
const Expense = require("../model/expense.model.js");
const Commitment = require("../model/commitment.model.js");

exports.index = async (req, res) => {
    const { startDate, endDate } = req.query;
    const userId = new mongoose.Types.ObjectId(req.query.userId);

    const startOfMonth = new Date(startDate || new Date(new Date().getFullYear(), new Date().getMonth(), 1));
    const endOfToday = new Date(endDate || new Date());
    endOfToday.setHours(23, 59, 59, 999);

    const currentDate = new Date();
    if (endOfToday > currentDate) {
        endOfToday.setTime(currentDate.getTime());
    }

    try {
        const dailyExpenses = await Expense.aggregate([
            {
                $match: {
                    createdBy: userId,
                    paidOn: { $gte: startOfMonth, $lte: endOfToday },
                    category: { $ne: 7 }
                }
            },
            {
                $group: {
                    _id: { $dayOfMonth: "$paidOn" },
                    totalAmount: { $sum: { $toDouble: "$amount" } }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
        const dailyTotals = new Array(daysInMonth).fill(0);
        dailyExpenses.forEach(expense => {
            if (expense._id - 1 < dailyTotals.length) {
                dailyTotals[expense._id - 1] = expense.totalAmount;
            }
        });

        const monthlyCategoryExpenses = await Expense.aggregate([
            {
                $match: {
                    createdBy: userId,
                    paidOn: { $gte: startOfMonth, $lte: endOfToday }
                }
            },
            {
                $group: {
                    _id: "$category",
                    totalAmount: { $sum: { $toDouble: "$amount" } }
                }
            }
        ]);

        const commitmentAggregates = await Commitment.aggregate([
            {
                $match: {
                    createdBy: userId,
                    status: { $ne: 2 },
                    payType: { $ne: 2 },
                }
            },
            {
                $group: {
                    _id: "$payFor",
                    totalPaid: { $sum: { $toDouble: "$paidAmount" } },
                    totalPending: { $sum: { $toDouble: "$balanceAmount" } }
                }
            },
            {
                $project: {
                    payFor: "$_id",
                    totalPaid: 1,
                    totalPending: 1,
                    _id: 0
                }
            },
            {
                $match: {
                    totalPending: { $gt: 0 }
                }
            }
        ]);

        const totalSavingsData = await Commitment.aggregate([
            {
                $match: {
                    createdBy: userId,
                    payType: 2, // Only include savings commitments
                    status: 1
                }
            },
            {
                $group: {
                    _id: null, // Grouping all savings together
                    totalSavings: { $sum: { $toDouble: "$paidAmount" } } // Sum paidAmount for savings
                }
            }
        ]);

        const totalSavings = totalSavingsData.length > 0 ? totalSavingsData[0].totalSavings : 0;

        const monthlyExpenses = await Expense.aggregate([
            {
                $match: {
                    createdBy: userId,
                    category: { $ne: 7 }
                }
            },
            {
                $group: {
                    _id: { $month: "$paidOn" },
                    totalAmount: { $sum: { $toDouble: "$amount" } }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const monthlyTotals = new Array(12).fill(0);
        monthlyExpenses.forEach(expense => {
            monthlyTotals[expense._id - 1] = expense.totalAmount;
        });

        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth();
        const today = new Date().getDate();

        const upcomingPayments = await Commitment.aggregate([
            {
                $match: {
                    createdBy: userId,
                    status: 1,           // Ongoing status
                    category: 1          // EMI category
                }
            },
            {
                $lookup: {
                    from: "commitmenthistories",
                    localField: "_id",
                    foreignField: "commitmentId",
                    as: "commitmentHistories"
                }
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
                                    { $eq: [{ $month: "$$history.paidDate" }, currentMonth + 1] } // month is 1-based
                                ]
                            }
                        }
                    },
                    dueInDays: {
                        $subtract: ["$dueDate", today] // difference between dueDate and today's day
                    }
                }
            },
            {
                $match: {
                    "commitmentHistories.0": { $exists: false } // ensures no entries in current month
                }
            },
            {
                $sort: {
                    dueInDays: 1 // Sort by dueInDays in ascending order
                }
            }
        ]);


        res.status(200).json({
            dailyTotals,
            monthlyCategoryExpenses,
            commitments: commitmentAggregates,
            monthlyTotals,
            totalSavings,
            upcomingPayments
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            status: "error",
            code: 500,
            data: [],
            message: "Internal Server Error"
        });
    }
};
