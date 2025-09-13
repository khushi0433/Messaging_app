const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const prisma = require('../config/db');
require('dotenv').config();

const sendVerificationEmail = async (user) => {
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const verificationLink = `http://localhost:3000/api/auth/verify-email?token=${token}`;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: 'Email Verification',
        html: `Please click this link to verify your email: <a href="${verificationLink}">${verificationLink}</a>`
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Verification email sent');
    } catch (error) {
        console.error('Error sending verification email:', error);
    }
};

const register = async (req, res) => {
    const { username, password, email } = req.body;
    try{
        const existingUser = await prisma.user.findFirst({ where: { OR: [{ username }, { email }] }});
        if(existingUser) {
            return res.status(400).json({ message: 'Username or email already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await prisma.user.create({
            data: { username, email, password: hashedPassword },
        });

        await sendVerificationEmail(newUser);
        res.status(201).json({ message: 'User registered. Please verify your email.', userId: newUser.id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error'});
    }
};

const verifyEmail = async (req, res) => {
    const { token } = req.query;
    if (!token) {
        return res.status(400).json({ message: 'Token is required' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        await prisma.user.update({
            where: { id: userId },
            data: { isVerified: true },
        });

        res.status(200).json({ message: 'Email verified successfully' });
    } catch (error) {
        res.status(400).json({ message: 'Invalid or expired token' });
    }
};

const login = async (req,res) => {
    const {username, password, email } = req.body;

    try {
        const user = await prisma.user.findFirst({ where: { OR: [{ username}, { email }]}})
        if(!user) {
            return res.status(400).json({ message: 'Invalid credentials'});
        }
        if(!user.isVerified) {
            return res.status(400).json({ message: 'Please verify your email before logging in.'});
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch) {
            return res.status(400).json({ message: 'Invalid password'});
        }
        const token = jwt.sign(
            { id: user.id, username: user.username},
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        res.json({ 
            token,
            message: 'Login successful',
            user: { id: user.id, username: user.username, email: user.email }
         });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error'});
    }
};

const getAllUsers = async (req, res) => {
    try {
    const users = await prisma.user.findMany();

    const filteredUsers = users.filter(user => user.id !== req.user.id);
    res.json(filteredUsers);
} catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error'});
}
};

module.exports = { register, login, getAllUsers, verifyEmail };