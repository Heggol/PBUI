const ready = require('./ready');
const interactionCreate = require('./interactionCreate');

/**
 * Register all Discord event handlers to the client
 * @param {Object} client Discord.js client
 */
function registerEvents(client) {
    client.once('ready', ready);
    client.on('interactionCreate', interactionCreate);
}

module.exports = {
    registerEvents
};