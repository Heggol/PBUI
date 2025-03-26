const { Client, GatewayIntentBits, REST, Routes } = require('discord.js');
const config = require('../config');
const commands = require('../commands');
const discordEvents = require('../events/discord');

/**
 * Initialize the Discord client with appropriate intents
 * @returns {Object} The configured Discord client
 */
function initializeDiscordClient() {
    const client = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages
        ]
    });
    discordEvents.registerEvents(client);

    return client;
}

/**
 * Register all slash commands with Discord
 * @returns {Promise} Promise that resolves when commands are registered
 */
async function registerCommands() {
    const rest = new REST({ version: '10' }).setToken(config.DISCORD_BOT_TOKEN);

    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationCommands(config.DISCORD_CLIENT_ID),
            { body: commands.map(command => command.data.toJSON()) }
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error('Error registering commands:', error);
    }
}

/**
 * Send a message to the configured match channel
 * @param {string} message The message to send
 * @returns {Promise|null} Promise from the send operation or null if no channel
 */
async function sendToMatchChannel(message) {
    if (!config.state.matchChannel || !message) return null;

    try {
        if (config.state.lastMessage) {
            return await config.state.lastMessage.edit(message);
        } else {
            const sentMessage = await config.state.matchChannel.send(message);
            config.state.lastMessage = sentMessage;
            return sentMessage;
        }
    } catch (error) {
        console.error('error sending/editing message:', error);
        if (error.code === 10008) {
            const sentMessage = await config.state.matchChannel.send(message);
            config.state.lastMessage = sentMessage;
            return sentMessage;
        }
    }
    return null;
}

module.exports = {
    initializeDiscordClient,
    registerCommands,
    sendToMatchChannel
};