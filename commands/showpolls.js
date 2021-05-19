var methods = {}
const Discord = require('discord.js')

methods.showpolls = async function(message, args){
    if(await getUUID(args[1]) == 'invalid player'){
        message.channel.send(createErrorEmbed('This player does not exist!'))
    }
}