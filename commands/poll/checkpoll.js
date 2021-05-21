const Discord = require('discord.js')

module.exports = {
    name: 'checkpoll',
    aliases: ['cp'],
    usage: 'check [poll message id]',
    description: 'Checks the stats of a current or ended poll',
    async execute(message, args, config, fs) {
        if(!message.member.hasPermission('ADMINISTRATOR') && args[2] !== 'override'){
            return message.channel.send(createErrorEmbed('You do not have permission to use this command!'))
        }
        if(args[2] == 'override' && message.author.id !== '347884694408265729'){
            return message.channel.send(createErrorEmbed('You do not have permission to use this command!'))
        }
        if(!args[1]){
            return message.channel.send(createErrorEmbed('Please provide a valid poll message ID'))
        }
        if(!getPoll(args[1])){
            return message.channel.send(createErrorEmbed('Please provide a valid poll message ID'))
        }
        return message.channel.send({ embed: getPollInProgressEmbed(getPoll(args[1])) })
    },
};