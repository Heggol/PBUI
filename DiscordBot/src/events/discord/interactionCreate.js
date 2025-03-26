const commands = require('../../commands');

/**
 * Handles Discord interactionCreate events
 * @param {Object} interaction The Discord interaction object
 */
module.exports = async function (interaction) {
    if (!interaction.isCommand()) return;

    const command = commands.getCommand(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(`Error executing ${interaction.commandName}:`, error);

        const replyOptions = {
            content: 'There was an error executing this command!',
            ephemeral: true
        };

        if (interaction.replied || interaction.deferred) {
            await interaction.followUp(replyOptions);
        } else {
            await interaction.reply(replyOptions);
        }
    }
};