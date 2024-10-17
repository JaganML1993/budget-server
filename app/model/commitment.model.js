const mongoose = require("mongoose");

const CommitmentSchema = mongoose.Schema({
    payFor: { type: String, required: true },
    totalEmi: { type: Number, required: true },
    paid: { type: mongoose.Types.Decimal128, required: true },
    pending: { type: mongoose.Types.Decimal128, required: true },
    emiAmount: { type: mongoose.Types.Decimal128, required: true },
    paidAmount: { type: mongoose.Types.Decimal128, required: true },
    balanceAmount: { type: mongoose.Types.Decimal128, required: true },
    payType: {
        type: Number,
        enum: [1, 2], // 1 - Expenses, 2 - Savings 
        required: true
    },
    category: {
        type: Number,
        enum: [1, 2], // 1 - EMI, 2 - Full
        required: true
    },
    remarks: { type: String },
    attachment: [{ type: String }], // Assuming attachments are strings (e.g., URLs)
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to User model
    status: {
        type: Number,
        enum: [1, 2], // 1 - Ongoing, 2 - Completed
        required: true
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model("Commitment", CommitmentSchema);
