const mongoose = require("mongoose");

const HouseSavingSchema = mongoose.Schema({
    amount: {
        type: mongoose.Types.Decimal128,
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    saving_type: {
        type: String,
        enum: ["bank transfer", "cash", "money bank"],
        required: true,
    },
    remarks: {
        type: String,
        default: "",
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model("HouseSaving", HouseSavingSchema);
