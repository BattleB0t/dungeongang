const Discord = require('discord.js')

module.exports = {
    name: 'unverify',
    aliases: [],
    usage: 'unverify <@person>',
    description: 'unverifies a person (admin+ only)',
    async execute(message, args, config, fs) {
        if (message.channel.id !== config.discord.update_channel && message.channel.id !== config.discord.staff_commands) { return; }
        if (!message.member.isOwner()) {
            if (!message.member.roles.cache.has(config.discord.admin_role) && !message.member.hasPermission('ADMINISTRATOR')) {
                return message.channel.send(createErrorEmbed('You do not have permission to use this command!'))
            }
        }
        message.delete()
        if(!message.mentions.members.first()){
            return message.channel.send(createErrorEmbed('Please mention a valid user!'))
        }

        message.mentions.members.first().roles.remove(config.discord.member_role)
        let verified = JSON.parse(fs.readFileSync('./data/verified.json'))
        if (verified.user_ids.includes(message.mentions.members.first().user.id)) {
            verified.user_ids.splice(verified.user_ids.indexOf(message.mentions.members.first().user.id), 1)
            delete verified.users[message.mentions.members.first().user.id]
            fs.writeFileSync('./data/verified.json', JSON.stringify(verified, null, 2))
            return message.channel.send(createSuccessEmbed(`User <@${message.mentions.members.first().user.id}> was unverified!`))
        } else {
            return message.channel.send(createErrorEmbed('This user isn\'t verified!'))
        }
    }
}