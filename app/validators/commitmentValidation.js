const { body } = require('express-validator');

const commitmentValidation = [
    body('payFor')
        .notEmpty()
        .withMessage('Pay for is required')
        .trim()
        .escape(),
    body('totalEmi')
        .notEmpty()
        .withMessage('Total EMI is required')
        .isInt({ min: 1 })
        .withMessage('Total EMI must be an integer and at least 1'),
    body('emiAmount')
        .notEmpty()
        .withMessage('EMI amount is required')
        .isDecimal()
        .withMessage('EMI amount must be a valid decimal number'),
    body('payType')
        .notEmpty()
        .isIn([1, 2]) // 'Expenses', 'Savings'
        .withMessage('Pay type must be either Expenses or Savings')
        .trim()
        .escape(),
    body('category')
        .notEmpty()
        .isIn([1, 2]) // 'EMI', 'Full'
        .withMessage('Category must be either EMI or Full')
        .trim()
        .escape(),
    body('remarks')
        .optional()
        .trim()
        .escape(),
    body('status')
        .notEmpty()
        .isIn([1, 2])
        .withMessage('Status must be either Ongoing or Completed'),

];

module.exports = commitmentValidation;
