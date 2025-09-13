const express = require('express');
const prisma = require('../config/db');
require('dotenv').config();

const sendMessage = async (req, res) => {
    const { toUserId, content } = req.body;
    const senderId = req.user.id;
    if (!toUserId || !content) {
        return res.status(400).json({ message: 'toUserId and content are required'});
    }
    try {
        const message = await prisma.message.create({
            data: {
                senderId,
                receiverId: toUserId,
                content
            },
        });
        res.status(201).json({ message });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error'});
    }
};

const getConversation = async (req, res) => {
    const withUserId = parseInt(req.params.withUserId);
    const userId = req.user.id;
    if (isNaN(withUserId)) {
        return res.status(400).json({ message: 'Invalid user ID'});
    }
    try {
        const messages = await prisma.message.findMany({
            where: {
                OR: [
                    { senderId: userId, receiverId: withUserId },
                    { senderId: withUserId, receiverId: userId },
                ],
            },
            orderBy: { createdAt: 'asc' },
        });
        res.status(200).json({ messages });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error'});
    }
};

module.exports = { sendMessage, getConversation };
