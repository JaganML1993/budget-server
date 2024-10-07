const mongoose = require("mongoose");

const CommitmentSchema = mongoose.Schema({
    payFor: String,
    category: String,
    payType: String,
    amount: mongoose.Types.Decimal128,
    paid: mongoose.Types.Decimal128,
    remarks: String,
    status: String,
    total: Number,
}, {
    timestamps: true,
});

module.exports = mongoose.model("Commitment", CommitmentSchema);
