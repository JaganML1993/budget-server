const { body } = require('express-validator');

const commitmentValidation = [
    body('payFor')
        .notEmpty()
        .withMessage('Pay for is required')
        .trim()
        .escape(),
    body('category')
        .notEmpty()
        .isIn(['1', '2', '3', '4']) // 1 - EMI, 2 - Full, 3 - Cheetu, 4 - House
        .withMessage('Category must be one of the following: EMI, Full, Cheetu, or House')
        .trim()
        .escape(),
    body('payType')
        .notEmpty()
        .isIn(['1', '2']) // 1 - Expenses, 2 - Savings
        .withMessage('Pay type must be one of the following: Expenses or Savings')
        .trim()
        .escape(),
    body('amount')
        .notEmpty()
        .withMessage('Amount is required')
        .isDecimal()
        .withMessage('Amount must be a valid number'),
    body('remarks')
        .optional()
        .trim()
        .escape(),
    body('status')
        .notEmpty()
        .isIn(['1', '2']) // 1 - Ongoing, 2 - Completed
        .withMessage('Status must be either Ongoing or Completed'),
    body('total')
        .notEmpty()
        .withMessage('Total is required')
        .isInt({ min: 1 })
        .withMessage('Total must be an integer and at least 1'),
];


module.exports = commitmentValidation;
