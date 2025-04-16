const { body } = require('express-validator');

const houseSavingValidation = [
    body('amount')
        .notEmpty()
        .withMessage('Amount is required')
        .isDecimal({ decimal_digits: '0,2' })
        .withMessage('Amount must be a decimal with up to 2 decimal places'),

    body('date')
        .notEmpty()
        .withMessage('Date is required')
        .isISO8601()
        .withMessage('Date must be a valid date in ISO8601 format'),

    body('saving_type')
        .notEmpty()
        .withMessage('Saving type is required')
        .isIn(['bank transfer', 'cash', 'money bank'])
        .withMessage('Saving type must be one of: bank transfer, cash, money bank'),

    body('remarks')
        .optional()
        .isString()
        .withMessage('Remarks must be a string'),
];

module.exports = houseSavingValidation;
