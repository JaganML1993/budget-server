const mongoose = require("mongoose");

const CommitmentHistorySchema = mongoose.Schema({
    commitmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Commitment', required: true },
    amount: { type: mongoose.Types.Decimal128, required: true },
    currentEmi: { type: Number, required: true },
    paidDate: { type: Date, required: true },
    remarks: { type: String },
    attachment: [{ type: String }],
}, {
    timestamps: true,
});

module.exports = mongoose.model("CommitmentHistory", CommitmentHistorySchema);
