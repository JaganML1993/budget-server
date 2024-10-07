const mongoose = require("mongoose");

const AdminSchema = mongoose.Schema({
    fullname: String,
    email: String,
    password: String,
    status: {
        type: Boolean,
        default: true,  // Set default value to true (1)
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model("User", AdminSchema);
