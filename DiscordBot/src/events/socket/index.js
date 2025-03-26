const connect = require('./connect');
const disconnect = require('./disconnect');
const initialState = require('./initialState');
const stateUpdated = require('./stateUpdated');
const stateReset = require('./stateReset');

/**
 * Register all Socket.io event handlers
 * @param {Object} socket Socket.io client
 */
function registerEvents(socket) {
    socket.on('connect', connect);
    socket.on('disconnect', disconnect);
    socket.on('initial-state', initialState);
    socket.on('state-updated', stateUpdated);
    socket.on('state-reset', stateReset);
}

module.exports = {
    registerEvents
};