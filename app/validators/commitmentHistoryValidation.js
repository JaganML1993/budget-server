const { body } = require('express-validator');

const commitmentHistoryValidation = [

    body('amount')
        .notEmpty()
        .withMessage('Amount is required')
        .isDecimal()
        .withMessage('Amount must be a valid decimal number'),

    body('currentEmi')
        .notEmpty()
        .withMessage('Current EMI is required')
        .isInt({ min: 1 })
        .withMessage('Current EMI must be a positive integer'),

    body('paidDate')
        .notEmpty()
        .withMessage('Paid date is required')
        .isISO8601()
        .withMessage('Paid date must be a valid date in ISO 8601 format'),

    body('remarks')
        .optional()
        .trim()
        .escape(),

    body('attachment')
        .optional()
        .isString()
        .withMessage('Attachment must be a string'),
];

module.exports = commitmentHistoryValidation;
