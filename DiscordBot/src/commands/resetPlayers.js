const { SlashCommandBuilder } = require('discord.js');
const config = require('../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('resetplayers')
        .setDescription('Reset all player names to defaults'),

    async execute(interaction) {
        // Tiebreaker not needed adding it anyway :shrug:
        config.state.players = {
            0: "Tiebreaker",
            1: "Player 1",
            2: "Player 2"
        };

        await interaction.reply('Player names have been reset to defaults.');
    }
};