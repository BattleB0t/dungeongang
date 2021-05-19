var methods = {}
const Discord = require('discord.js')
const config = require('../config.json')

methods.endpoll = async function(message, args){
    if(!message.member.roles.cache.has(config.discord.poll_creation_role)){
        return message.channel.send(createErrorEmbed('You do not have permission to use this command!'))
    }
    let polldata = await endActivePoll(args[1])
    if(polldata == 'success'){
        return message.channel.send(createSuccessEmbed('Poll with message ID: '+ args[1] +' has been successfully ended!'))
    }
    if(!args[1]){
        return message.channel.send(createErrorEmbed('Please provide a valid poll message ID'))
    }
    if(polldata == 'invalid poll'){
        return message.channel.send(createErrorEmbed('Please provide a valid poll message ID'))
    }
    if(polldata == 'poll ended'){
        return message.channel.send(createErrorEmbed('This poll has already ended!'))
    }
}

exports.data = methods