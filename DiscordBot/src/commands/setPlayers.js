const { SlashCommandBuilder } = require('discord.js');
const config = require('../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setplayer')
        .setDescription('Set a player name for pick/ban updates')
        .addIntegerOption(option =>
            option.setName('number')
                .setDescription('Player number (1 or 2)')
                .setRequired(true)
                .addChoices(
                    { name: 'Player 1', value: 1 },
                    { name: 'Player 2', value: 2 }
                ))
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Discord user to set as player')
                .setRequired(true)),
    async execute(interaction) {
        const playerNumber = interaction.options.getInteger('number');
        const user = interaction.options.getUser('user');
        
        // Store the user's ID or tag as needed
        config.state.players[playerNumber] = user.username; // or user.tag if you prefer the username#discriminator format
        
        await interaction.reply(`Set Player ${playerNumber} to ${user}`); // This will automatically format as a mention
    }
};