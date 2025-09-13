const { body } = require('express-validator');

const registerValidation = [
    body('username').trim().notEmpty().withMessage('Username is required').isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),
    body('password').trim().notEmpty().withMessage('Password is required').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
    body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email format')
];

const loginValidation = [
    body('username').trim().notEmpty().withMessage('Username is required'),
    body('password').trim().notEmpty().withMessage('Password is required'),
    body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email format')
];

module.exports = { registerValidation, loginValidation };
