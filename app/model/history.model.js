const mongoose = require("mongoose");

const HistorySchema = mongoose.Schema({
  commitment_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Commitment"
  },
  amount: {
    type: mongoose.Types.Decimal128,
    required: true,
  },
  paid_date: {
    type: Date,
    default: null,
  },
  attachments: {
    type: String,
    default: null,
  },
  remarks: {
    type: String,
    default: null,
  },
  balance_amount_if_any: {
    type: mongoose.Types.Decimal128,
    default: 0.00,
  },
  payment_number: {
    type: Number,
    default: 0,
  },
  transferred_in: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
  versionKey: false
});

module.exports = mongoose.model("History", HistorySchema);
