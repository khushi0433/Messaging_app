const express = require('express');
const { Server } = require('socket.io');

function initSocket(server) {
const io = new Server(server);
io.on('connection', (socket) => {
    console.log('User connected: ' + socket.id);
    socket.broadcast.emit('user joined', socket.id);

    socket.on('chat message', (msg) => {
        io.emit('chat message', msg);
        console.log('Message received: ', msg);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected: ' + socket.id);
        io.emit('user left', socket.id);
    });
});
    return io;
}

module.exports = initSocket;