const { body } = require('express-validator');

const notesValidation = [
    body('title')
        .notEmpty()
        .withMessage('Title is required')
        .isString()
        .withMessage('Title must be a string'),

    body('content')
        .notEmpty()
        .withMessage('Content is required')
        .isString()
        .withMessage('Content must be a string'),

    body('attachment')
        .optional()
        .isString()
        .withMessage('Attachment must be a valid URL or file path'),

    body('createdBy')
        .notEmpty()
        .withMessage('User ID is required')
        .isMongoId()
        .withMessage('CreatedBy must be a valid MongoDB ObjectId'),
];

module.exports = notesValidation;
