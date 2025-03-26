require('dotenv').config();

module.exports = {
  DISCORD_BOT_TOKEN: process.env.DISCORD_BOT_TOKEN,
  DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID,
  
  SOCKET_SERVER_URL: process.env.SOCKET_SERVER_URL || 'http://localhost:3001',
  
  state: {
    matchChannel: null,
    isActive: false,
    lastState: null,
    lastMessage: null,
    players: {
      0: "Tiebreaker",
      1: "Player 1",
      2: "Player 2"
    }
  }
};