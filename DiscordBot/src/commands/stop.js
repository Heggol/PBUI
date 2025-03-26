const { SlashCommandBuilder } = require('discord.js');
const config = require('../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Stop listening for pick/ban updates'),

    async execute(interaction) {
        config.state.isActive = false;
        await interaction.reply('Stopped listening for pick/ban updates');
    }
};