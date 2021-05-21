const { Client, Collection } = require('discord.js');

module.exports = class extends Client {
    constructor(config) {
        super({
            disabledEvents: ['TYPING_START'],
            partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
        });

        this.commands = new Collection();

        this.queue = new Map();

        this.config = config;
    }
};
