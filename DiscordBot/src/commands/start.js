const { SlashCommandBuilder } = require('discord.js');
const config = require('../config');
const { formatStateUpdate } = require('../utils/stateFormatter');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('start')
        .setDescription('Start listening for pick/ban updates'),

    async execute(interaction) {
        if (!config.state.matchChannel) {
            await interaction.reply('Please set a match channel first using /setchannel');
            return;
        }
        config.state.lastMessage = null;
        config.state.isActive = true;
        await interaction.reply(`Started listening for pick/ban updates in #${config.state.matchChannel.name}`);

        if (config.state.lastState) {
            const message = formatStateUpdate(config.state.lastState);
            if (message) {
                const discordService = require('../services/discordService');
                discordService.sendToMatchChannel(message);
            }
        }
    }
};