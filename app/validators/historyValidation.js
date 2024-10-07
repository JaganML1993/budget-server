const { body } = require('express-validator');

const historyValidation = [
    body('commitment_id')
        .notEmpty()
        .withMessage('Commitment ID is required')
        .isMongoId()
        .withMessage('Invalid Commitment ID format'),

    body('amount')
        .notEmpty()
        .withMessage('Amount is required')
        .isDecimal({ decimal_digits: '0,2' })
        .withMessage('Amount must be a decimal with up to 2 decimal places'),

    body('paid_date')
        .optional()
        .isISO8601()
        .withMessage('Paid date must be a valid date'),

    body('attachments')
        .optional()
        .isString()
        .withMessage('Attachments must be a string'),

    body('remarks')
        .optional()
        .isString()
        .withMessage('Remarks must be a string'),

    body('balance_amount_if_any')
        .optional()
        .isDecimal({ decimal_digits: '0,2' })
        .withMessage('Balance amount must be a decimal with up to 2 decimal places'),

    body('payment_number')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Payment number must be a non-negative integer'),

    body('transferred_in')
        .notEmpty()
        .withMessage('Transferred in is required')
        .isString()
        .withMessage('Transferred in must be a string'),
];

module.exports = historyValidation;
