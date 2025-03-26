const config = require('../config');

/**
 * Convert song state numbers to readable names with custom player names
 * @param {number} stateValue The state value from the Socket.io server
 * @returns {string} Human-readable state name
 */
function getSongStateName(stateObj) {
    if (typeof stateObj !== 'object' || stateObj === null) {
        return `Unknown (${stateObj})`;
    }

    const { player, status } = stateObj;

    switch (status) {
        case 'pick':
            return player === 0 ? `Tiebreaker` : `Picked by ${config.state.players[player]}`;
        case 'ban': 
            return `Banned by ${config.state.players[player]}`;
        default:
            return `Unknown (${status})`;
    }
}

/**
 * Format state updates into readable Discord messages
 * @param {Object} state Current state from socket
 * @param {Object|null} previousState Previous state for comparison
 * @returns {string} Formatted message for Discord
 */
function formatStateUpdate(state, previousState = null) {
    const { song_states, current_flow_step } = state;

    const changedSongs = [];
    for (const songId in song_states) {
        if (!previousState?.song_states || previousState.song_states[songId] !== song_states[songId]) {
            changedSongs.push({ id: songId, ...song_states[songId] });
        }
    }

    let message = '';

    if (!previousState || previousState.current_flow_step !== current_flow_step) {
        console.log(`Flow step changed: ${previousState?.current_flow_step || 0} → ${current_flow_step}\n`);
    }

    changedSongs.sort((a, b) => a.step - b.step);

    if (Object.keys(changedSongs).length > 0) {
        message += `**Song updates:**\n`;
        for (const songId in changedSongs) {
            const song = changedSongs[songId];
            const state = getSongStateName(changedSongs[songId]);
            message += `- **${song.name}:** ${state}\n`;
        }
    }

    return message;
}

module.exports = {
    getSongStateName,
    formatStateUpdate
};