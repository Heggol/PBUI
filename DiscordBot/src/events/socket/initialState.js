const config = require('../../config');
const { formatStateUpdate } = require('../../utils/stateFormatter');
const { sendToMatchChannel } = require('../../services/discordService');

/**
 * Handles Socket.io 'initial-state' event
 * @param {Object} state Initial state from socket.io server
 */
module.exports = function (state) {
    console.log('Received initial state:', state);
    config.state.lastState = state;

    if (config.state.isActive && config.state.matchChannel) {
        const message = formatStateUpdate(state);
        if (message) {
            sendToMatchChannel(message);
        }
    }
};