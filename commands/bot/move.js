module.exports = {
    name: 'move',
    aliases: ['m'],
    usage: 'move [user]',
    description: 'moves a user to your current voice channel',
    hidden: false,
    async execute() {
        let message = messageParam, args = argsParam, config = configParam, fs = fsParam
        if (args[2] === 'to' && message.mentions.channels.first() && message.member.roles.cache.has(config.discord.staff_role)) {
            if(!message.mentions.members.first()){
                return message.channel.send(createErrorEmbed('Please mention a valid user!'))
            }
            if (!message.mentions.members.first().voice.channel) {
                return message.channel.send(createErrorEmbed('The user you are moving must be in a voice channel!'))
            }
            await message.mentions.members.first().voice.setChannel(message.mentions.channels.first(), 'Moved '+ message.mentions.members.first().user.tag +' into the channel '+ message.mentions.channels.first().name +' by '+ message.author.tag)
            return message.channel.send(createSuccessEmbed('Moved '+ args[1] +' into the channel <#'+ message.mentions.channels.first().id +'>'))
        }
        if (!message.member.roles.cache.has('856575336014807041')) {
            return message.channel.send(createErrorEmbed('You do not have permission to use this command!'))
        }
        if(!args[1]){
            return message.channel.send(createErrorEmbed('Please mention a valid user!'))
        }
        if(!message.mentions.members.first()){
            return message.channel.send(createErrorEmbed('Please mention a valid user!'))
        }
        if (!message.member.voice.channel) {
            return message.channel.send(createErrorEmbed('You must be in a voice channel to use this command!'))
        }
        if (!message.mentions.members.first().voice.channel) {
            return message.channel.send(createErrorEmbed('The user you are moving must be in a voice channel!'))
        }
        await message.mentions.members.first().voice.setChannel(message.member.voice.channel, 'Moved '+ message.mentions.members.first().user.tag +' into the channel '+ message.member.voice.channel.name +' by '+ message.author.tag)
        return message.channel.send(createSuccessEmbed('Moved '+ args[1] +' into the channel <#'+ message.member.voice.channel.id +'>'))
    },
};