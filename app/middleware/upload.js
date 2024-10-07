const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Define the uploads directory
const UPLOADS_DIR = 'uploads/';

// Ensure the uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true }); // Create directory if it doesn't exist
}

// Set up storage for images
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOADS_DIR); // Specify your uploads folder
    },
    filename: (req, file, cb) => {
        // Use original name and add a timestamp to avoid conflicts
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

// Create multer instance
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5, // Limit file size to 5MB
    },
    fileFilter: (req, file, cb) => {
        // Accept only image files
        const filetypes = /jpeg|jpg|png|gif/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('File type not allowed'));
    }
});

module.exports = upload;
