/**
 * Detect if there are new song states
 * @param {Object|null} oldsong_states Previous song states
 * @param {Object} newsong_states Current song states
 * @returns {boolean} True if new states are detected
 */
function hasNewSongState(oldsong_states, newsong_states) {
    if (!oldsong_states) return true;
    if (!newsong_states) return false;
    for (const songId in newsong_states) {
        if (!oldsong_states[songId] || oldsong_states[songId] !== newsong_states[songId]) {
            return true;
        }
    }

    return false;
}

/**
 * Determines if an update should be sent based on state changes
 * @param {Object|null} previousState The previous state
 * @param {Object} currentState The current state
 * @returns {boolean} True if an update should be sent
 */
function shouldSendUpdate(previousState, currentState) {
    if (!previousState) return true;

    const previousStep = previousState?.current_flow_step || 0;
    const currentStep = currentState.current_flow_step;

    return previousStep !== currentStep ||
        hasNewSongState(previousState?.song_states, currentState.song_states);
}

module.exports = {
    hasNewSongState,
    shouldSendUpdate
};