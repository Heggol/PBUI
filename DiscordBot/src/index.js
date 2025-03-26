const config = require('./config');
const { initializeDiscordClient, registerCommands } = require('./services/discordService');
const { initializeSocketClient } = require('./services/socketService');

async function main() {
    try {
        initializeSocketClient();
        const client = initializeDiscordClient();
        await registerCommands();
        await client.login(config.DISCORD_BOT_TOKEN);
    } catch (error) {
        console.error('Failed to initialize bot:', error);
        process.exit(1);
    }
}

main();