const { SlashCommandBuilder } = require('discord.js');
const config = require('../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('status')
        .setDescription('Show the current status of the pick/ban bot'),

    async execute(interaction) {
        const status = config.state.isActive ? 'Active' : 'Inactive';
        const channel = config.state.matchChannel ? `#${config.state.matchChannel.name}` : 'Not set';

        let response = `**Bot Status:** ${status}\n**Channel:** ${channel}\n\n**Player Names:**\n`;
        response += `- Player 1: ${config.state.players[1]}\n`;
        response += `- Player 2: ${config.state.players[2]}\n`;
        response += `- Tiebreaker: ${config.state.players[0]}`;

        await interaction.reply(response);
    }
};