const Expense = require("../model/expense.model.js"); // Adjust the path to your Expense model

exports.index = async (req, res) => {
    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfToday = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 23, 59, 59); // End of today

    try {
        // Aggregate expenses by day of the month from the start of the month to today
        const expenses = await Expense.aggregate([
            {
                $match: {
                    paidOn: {
                        $gte: startOfMonth,
                        $lte: endOfToday // Stop at the end of today
                    }
                }
            },
            {
                $group: {
                    _id: { $dayOfMonth: "$paidOn" }, // Group by day of the month
                    totalAmount: { $sum: { $toDouble: "$amount" } } // Sum the amounts (convert Decimal128 to double)
                }
            },
            {
                $sort: { _id: 1 } // Sort by day in ascending order
            }
        ]);

        // Prepare daily totals array with a slot for each day up to today
        const dailyTotals = new Array(currentDate.getDate()).fill(0); // Only up to today

        // Populate daily totals with the aggregated data
        expenses.forEach(expense => {
            dailyTotals[expense._id - 1] = expense.totalAmount;
        });

        // Send the daily totals as the response
        res.status(200).json(dailyTotals);
    } catch (err) {
        // Handle errors and return a 500 response
        res.status(500).json({
            status: "error",
            code: 500,
            data: [],
            message: "Internal Server Error",
        });
    }
};
