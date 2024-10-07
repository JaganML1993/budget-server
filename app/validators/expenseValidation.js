const { body } = require('express-validator');

const expenseValidation = [
    body('name')
        .notEmpty()
        .withMessage('Expense name is required')
        .isString()
        .withMessage('Expense name must be a string'),

    body('amount')
        .notEmpty()
        .withMessage('Amount is required')
        .isDecimal({ decimal_digits: '0,2' })
        .withMessage('Amount must be a decimal with up to 2 decimal places'),

    body('category')
        .notEmpty()
        .withMessage('Category is required')
        .isInt({ min: 0 })
        .withMessage('Category must be a non-negative integer'),

    body('paidOn')
        .notEmpty()
        .withMessage('Paid date is required')
        .isISO8601()
        .withMessage('Paid date must be a valid date in ISO8601 format'),

    // body('createdBy')
    //     .notEmpty()
    //     .withMessage('Created by is required')
    //     .isMongoId()
    //     .withMessage('Created by must be a valid MongoDB Object ID'),

    body('remarks')
        .optional()
        .isString()
        .withMessage('Remarks must be a string'),

    body('attachment')
        .optional()
        .isString()
        .withMessage('Attachment must be a string'),
];

module.exports = expenseValidation;
