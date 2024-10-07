const mongoose = require("mongoose");

const ExpenseSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    amount: {
        type: mongoose.Types.Decimal128,
        required: true
    },
    category: {
        type: Number,
        required: true
    },
    paidOn: {
        type: Date,
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    remarks: {
        type: String,
        default: ""
    },
    attachment: {
        type: String,
        default: ""
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model("Expense", ExpenseSchema);
