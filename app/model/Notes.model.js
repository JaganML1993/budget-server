const mongoose = require("mongoose");

const NoteSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        default: ""
    },
    attachment: {
        type: String, // Store file path or URL
        default: null
    },
    color: {
        type: String,
        default: "#27293d"
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Assuming notes are linked to a user
        required: true
    }
}, {
    timestamps: true,
});

module.exports = mongoose.model("Note", NoteSchema);
