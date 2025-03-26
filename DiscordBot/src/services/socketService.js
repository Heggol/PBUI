const { io } = require('socket.io-client');
const config = require('../config');
const socketEvents = require('../events/socket');

/**
 * Initializes and configures the Socket.io client
 * @returns {Object} The configured Socket.io client
 */
function initializeSocketClient() {
    const socket = io(config.SOCKET_SERVER_URL);
    socketEvents.registerEvents(socket);
    return socket;
}

module.exports = {
    initializeSocketClient
};