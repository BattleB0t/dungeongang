let methods = {}
const Discord = require('discord.js')
let prefix = '❮❯'

methods.verify = async function(message, args, config, fs){
    let verified = JSON.parse(fs.readFileSync('./commands/bot/verified.json'))
    if(!args[1]){
        return message.channel.send(createErrorEmbed('No username provided.'))
    }
    let uuid = await getUUID(args[1])
    if(uuid == 'invalid player'){
        return message.channel.send(createErrorEmbed('Invalid username!'))
    }
    if(message.channel.id != config.discord.verification_channel){
        return message.channel.send(createErrorEmbed('Please use this command in <#'+ config.discord.verification_channel +'>'))
    }
    if(message.member.roles.cache.find(r => r.id === config.discord.member_role) && verified.user_ids.includes(message.author.id)){
        return message.channel.send(createErrorEmbed('You are already verified!'))
    }
    if(verified.user_ids.includes(message.author.id)){
        message.channel.send(createErrorEmbed('You are already verified, giving member role...'))
        return message.member.roles.add(r => r.id == config.discord.member_role)
    }
    let verifiedJson = {
        "[message.author.id]": {
            "uuid": "uuid",
            "emotes": {
                "unlocked_emotes": [],
                "slots": [
                    {
                       "slot_id": 1,
                       "emote": "none" 
                    }
                ]
            }
        }
    }
}
