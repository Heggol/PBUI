/**
 * Handles the Discord 'ready' event
 * @param {Object} client The Discord client
 */
module.exports = function (client) {
    console.log(`Logged in as ${client.user.tag}`);
};