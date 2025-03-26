const setChannel = require('./setChannel');
const start = require('./start');
const stop = require('./stop');
const status = require('./status');
const setPlayer = require('./setPlayers');
const resetPlayers = require('./resetPlayers');

const commandsList = [
    setChannel,
    start,
    stop,
    status,
    setPlayer,
    resetPlayers
];

const commands = new Map();
commandsList.forEach(cmd => {
    commands.set(cmd.data.name, cmd);
});

module.exports = commandsList;
module.exports.getCommand = (name) => commands.get(name);