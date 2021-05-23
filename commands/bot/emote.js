const Discord = require('discord.js')
function hasUnicode(s) {
    return /[^\u0000-\u007f]/.test(s);
}

module.exports = {
    name: 'emote',
    aliases: [],
    usage: 'emote give/take/list [@user] [emote]',
    description: '',
    async execute(message, args, config, fs) {
        if(!message.member.roles.cache.has(config.discord.staff_role)){
            return message.channel.send(createErrorEmbed('You do not have permission to use this command!'))
        }
        if(!args[1]){
            return message.channel.send(createErrorEmbed('Incorrect usage!\nUsage: `emote give/take/list [@user] [:emote:]`'))
        }
        if(args[1] == 'give') {
            if(!args[2]){
                return message.channel.send(createErrorEmbed('Incorrect usage!\nUsage: `emote give [@user] [:emote:]`'))
            }
            if(!message.mentions.members.first()){
                return message.channel.send(createErrorEmbed('Please mention a valid user!'))
            }
            let emotes = JSON.parse(fs.readFileSync('./data/verified.json'))
            if(!emotes.user_ids.includes(message.mentions.members.first().id)){
                return message.channel.send(createErrorEmbed('This user has not yet verified with Dungeon Gang v2!'))
            }
            if(!hasUnicode(args[3])){
                return message.channel.send(createErrorEmbed('Please enter a valid emote!'))
            }
            if(emotes.users[message.mentions.members.first().id].emotes.given_emotes.includes(args[3])){
                return message.channel.send(createErrorEmbed(args[2] +' already has this emote!'))
            }
            emotes.users[message.mentions.members.first().id].emotes.given_emotes.push(args[3])
            fs.writeFileSync('./data/verified.json', JSON.stringify(emotes, null, 2))
            return message.channel.send(createSuccessEmbed('Added emote `'+ args[3] +'` to '+ args[2]))
        }
        if(args[1] == 'take') {
            if(!args[2]){
                return message.channel.send(createErrorEmbed('Incorrect usage!\nUsage: `emote take [@user] [:emote:]`'))
            }
            if(!message.mentions.members.first()){
                return message.channel.send(createErrorEmbed('Please mention a valid user!'))
            }
            let emotes = JSON.parse(fs.readFileSync('./data/verified.json'))
            if(!emotes.user_ids.includes(message.mentions.members.first().id)){
                return message.channel.send(createErrorEmbed('This user has not yet verified with Dungeon Gang v2!'))
            }
            if(!hasUnicode(args[3])){
                return message.channel.send(createErrorEmbed('Please enter a valid emote!'))
            }
            if(!emotes.users[message.mentions.members.first().id].emotes.given_emotes.includes(args[3])){
                return message.channel.send(createErrorEmbed(args[2] +' does not have this emote!'))
            }
            let index = emotes.users[message.mentions.members.first().id].emotes.given_emotes.indexOf(args[3])
            emotes.users[message.mentions.members.first().id].emotes.given_emotes.splice(index, 1)
            if(!emotes.users[message.mentions.members.first().id].emotes.unlocked_emotes.includes(args[3]) && message.mentions.members.first().hasEquipped(args[3], emotes)) {
                let slots = emotes.users[message.mentions.members.first().id].emotes.slots
                let slots2 = Object.keys(emotes.users[message.mentions.members.first().id].emotes.slots)
                for (let i = 0; i < slots2.length; i++){
                  let slot = Object.keys(emotes.users[message.mentions.members.first().id].emotes.slots)[i]
                  if (slots[slot].includes(args[3])){
                    slots[slot] = 'none'
                  }
                }
            }
            fs.writeFileSync('./data/verified.json', JSON.stringify(emotes, null, 2))
            return message.channel.send(createSuccessEmbed('Removed emote `'+ args[3] +'` from '+ args[2]))
        }
        if(args[1] == 'list'){
            if(!args[2]){
                return message.channel.send(createErrorEmbed('Incorrect usage!\nUsage: `emote list [@user]`'))
            }
            if(!message.mentions.members.first()){
                return message.channel.send(createErrorEmbed('Please mention a valid user!'))
            }
            let emotes = JSON.parse(fs.readFileSync('./data/verified.json'))
            if(!emotes.user_ids.includes(message.mentions.members.first().id)){
                return message.channel.send(createErrorEmbed('This user has not yet verified with Dungeon Gang v2!'))
            }
            return message.channel.send(await createEmoteEmbed2(emotes.users[message.mentions.members.first().id]))
        }
    },
};