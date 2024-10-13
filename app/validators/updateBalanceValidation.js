const { body } = require('express-validator');

const updateBalanceValidation = [
    body('amount')
        .notEmpty()
        .withMessage('Amount is required')
        .isDecimal({ decimal_digits: '0,2' })
        .withMessage('Amount must be a decimal with up to 2 decimal places'),

    body('remarks')
        .notEmpty()
        .withMessage('Remarks are required')
        .isString()
        .withMessage('Remarks must be a string'),

    body('paidOn')
        .notEmpty()
        .withMessage('Paid On date is required')
        .isISO8601()
        .withMessage('Paid On date must be a valid date in ISO format (YYYY-MM-DD)'),
];

module.exports = updateBalanceValidation;

