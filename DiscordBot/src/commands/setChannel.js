const { SlashCommandBuilder } = require('discord.js');
const config = require('../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setchannel')
        .setDescription('Set the channel for match pick/ban updates')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('The channel to send updates to')
                .setRequired(true)),

    async execute(interaction) {
        const channel = interaction.options.getChannel('channel');
        config.state.matchChannel = channel;
        await interaction.reply(`Match channel set to #${channel.name}`);
    }
};