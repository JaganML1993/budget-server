const { body } = require('express-validator');

const loginValidation = [
    body('email')
        .notEmpty().withMessage('Email is required.')
        .isEmail().withMessage('Please provide a valid email address.')
        .trim()
        .escape(),

    body('password')
        .notEmpty().withMessage('Password is required.')
        .isLength({ min: 6, max: 25 }).withMessage('Password must be between 6 and 25 characters long.')
        .trim(),
];

module.exports = loginValidation;
