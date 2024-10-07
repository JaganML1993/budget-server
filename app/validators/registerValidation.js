const { body } = require('express-validator');

const registerValidation = [
    body('fullname')
    .notEmpty().withMessage('Full name is required')
    .isLength({ min: 6 }).withMessage('Full name must be at least 6 characters long')
    .isLength({ max: 25 }).withMessage('Full name must be no longer than 25 characters')
    .trim().escape(),
    body('email').notEmpty().isEmail().withMessage('email is required').trim().escape(),
    // .custom(async (value) => {
    //     const user = await Admin.findOne({ email: value });
    //     if (user) {
    //         return Promise.reject('E-mail already in use');
    //     }
    // }),
    body('password').notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }).isLength({ max: 25 }).withMessage('Password must be at least 6 characters long').trim(),
    // body('status').isIn(['1', '0']).withMessage('Status must be either "1" or "0"').trim().escape(),
];

module.exports = registerValidation;
