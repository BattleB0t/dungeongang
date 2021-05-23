const Discord = require('discord.js')

module.exports = {
    name: 'emote',
    aliases: [],
    usage: 'emote give/take [@user]',
    description: '',
    async execute(message, args, config, fs) {
        if(!args[1]){
            return message.channel.send(createErrorEmbed(''))
        }
    },
};