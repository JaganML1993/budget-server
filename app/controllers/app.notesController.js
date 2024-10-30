const { validationResult } = require('express-validator');
const Note = require("../model/Notes.model.js");

// Create and Save a new Note
exports.store = async (req, res) => {
    const errors = validationResult(req);

    // Handle validation errors
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        // Extract data from the request body
        const {
            title,
            content,
            createdBy,
            remarks,
        } = req.body;

        // Access the uploaded file
        const attachment = req.file ? req.file.path : ''; // Use the uploaded file path if available

        // Create a new Note instance
        const newNote = new Note({
            title,
            content,
            createdBy,
            remarks,
            attachment
        });

        // Save the new note to the database
        const savedNote = await newNote.save();

        // Send a success response with the saved note data
        res.status(201).json({
            status: "success",
            code: 201,
            data: savedNote,
            message: "Note created successfully",
        });

    } catch (err) {
        // Handle any errors that occur during the save process
        res.status(500).json({
            status: "error",
            code: 500,
            data: [],
            message: "Internal Server Error",
        });
    }
};

exports.show = async (req, res) => {
    try {
        const { userId } = req.query; // Get userId from the query parameters

        // Find notes based on createdBy (userId) and sort by createdAt in descending order
        const notes = await Note.find({ createdBy: userId }).sort({ createdAt: -1 });

        res.status(200).json({
            status: "success",
            code: 200,
            data: notes,
            message: "Notes retrieved successfully",
        });
    } catch (err) {
        res.status(500).json({
            status: "error",
            code: 500,
            data: [],
            message: "Internal Server Error",
        });
    }
};

exports.update = async (req, res) => {
    const { id } = req.params;
    const { title, content } = req.body;

    try {
        const updatedNote = await Note.findByIdAndUpdate(
            id,
            { title, content },
            { new: true, runValidators: true }
        );

        if (!updatedNote) {
            return res.status(404).json({ message: 'Note not found.' });
        }

        if (req.file) {
            updatedNote.attachment = req.file.path;
        }

        await updatedNote.save();

        res.status(200).json({
            status: "success",
            code: 200,
            data: updatedNote,
            message: 'Note updated successfully!',
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: "error",
            code: 500,
            data: [],
            message: 'Failed to update note.',
            error: error.message,
        });
    }
};

exports.delete = async (req, res) => {
    const { id } = req.params;

    try {

        const deletedNote = await Note.findByIdAndDelete(id);

        if (!deletedNote) {
            return res.status(404).json({ message: "Note not found." });
        }

        res.status(200).json({
            status: "success",
            code: 200,
            message: "Note deleted successfully.",
            data: deletedNote,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to delete note.", error: error.message });
    }
};

