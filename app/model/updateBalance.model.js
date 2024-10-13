const mongoose = require("mongoose");

const UpdateBalanceSchema = mongoose.Schema({
    amount: {
        type: mongoose.Types.Decimal128,
        required: true
    },
    expenseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Expense',
        required: true
    },
    remarks: {
        type: String,
        default: ""
    },
    paidOn: {
        type: Date,
        required: true
    }
}, {
    timestamps: true,
});

module.exports = mongoose.model("UpdateBalance", UpdateBalanceSchema);
