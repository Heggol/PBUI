const config = require('../../config');
const { sendToMatchChannel } = require('../../services/discordService');


module.exports = function () {
    console.log('State reset');
    config.state.lastMessage = null;
    if (config.state.isActive && config.state.matchChannel) {
        sendToMatchChannel('⚠️ Pick/Ban state has been reset');
    }

    config.state.lastState = null;
};