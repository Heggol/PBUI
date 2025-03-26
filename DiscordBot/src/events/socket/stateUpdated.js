const config = require('../../config');
const { formatStateUpdate } = require('../../utils/stateFormatter');
const { shouldSendUpdate } = require('../../utils/stateComparator');
const { sendToMatchChannel } = require('../../services/discordService');

/**
 * Handles Socket.io 'state-updated' event
 * @param {Object} state Updated state from socket.io server
 */
module.exports = function (state) {
    console.log('State updated:', state);

    if (config.state.isActive && config.state.matchChannel) {
        if (shouldSendUpdate(config.state.lastState, state)) {
            const message = formatStateUpdate(state, config.state.lastState);
            if (message) {
                sendToMatchChannel(message);
            }
        }
    }

    config.state.lastState = state;
};