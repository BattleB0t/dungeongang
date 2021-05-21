const Discord = require('discord.js')
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
    name: 'verify',
    aliases: [],
    usage: 'verify [username]',
    description: 'Verifies and links your minecraft account to your discord account',
    async execute(message, args, config, fs) {
        let verified = JSON.parse(fs.readFileSync('./data/verified.json'))
        message.delete()
        let tag = message.member.user.tag
        let username
        let originalMessage = message
        if(message.channel.id != config.discord.verification_channel){
            return message.channel.send(createErrorEmbed('Please use this command in <#'+ config.discord.verification_channel +'>'))
        }
        if(message.member.roles.cache.find(r => r.id === config.discord.member_role) && verified.user_ids.includes(message.author.id)){
            return message.channel.send(createErrorEmbed('You are already verified!'))
        }
        if (!args[1]) {
            try {
                username = message.member.displayName;
                username = username.split(" ")[1]
                username = username.replace(/\W/g, '');
            } catch (error) {
                return message.channel.send(createErrorEmbed('An error has occurred while getting this user\'s username'))
            }
        } else {
            username = args[1];
        }
        return message.channel.send(
            new Discord.MessageEmbed()
                .setColor('0x00bfff')
                .setDescription('Grabbing data from API...')
        )
            .then(async message => {
                let uuid = await getUUID(username)
                if (uuid == 'invalid player') {
                    return message.edit(createErrorEmbed('This player does not exist!'))
                }
                let data = await findStats(uuid)
                if (data[0] == 'error') {
                    data.shift()
                    return message.edit(createErrorEmbed(data.toString()))
                }
                let linkedDiscord = await getDiscordFromPlayer(uuid)
                if (linkedDiscord == "Player does not have a linked discord") {
                    return message.edit(createErrorEmbed('You must link your discord in hypixel!'))
                } else if (linkedDiscord != tag) {
                    return message.edit(createErrorEmbed('That minecraft account is connected to a different discord!'))
                }
                let cataLevel = Math.floor(data.catacombs)
                originalMessage.member.giveCorrectCataRole(cataLevel)
                if(verified.user_ids.includes(message.author.id)){
                    message.channel.send(createSuccessEmbed('You are already verified, giving member role...'))
                    try {
                        await originalMessage.member.setNickname(`❮${cataLevel}❯ ${username}`)
                    } catch (e) { console.log(e) }
                    return message.member.roles.add(r => r.id === config.discord.member_role)
                }
                try {
                    await originalMessage.member.setNickname(`❮${cataLevel}❯ ${username}`)
                } catch (e) { console.log(e) }
                let verifiedJson = {
                    [message.author.id]: {
                      "uuid": uuid,
                      "emotes": {
                        "unlocked_emotes": [],
                        "slots": [
                          {
                            "slot_id": 1,
                            "emote": "none",
                            "type": "default"
                          }
                        ]
                      }
                    }
                  }
                verified.users.push(verifiedJson)
                fs.writeFileSync('./data/verified.json', JSON.stringify(verified, null, 2))
                message.edit(createSuccessEmbed(`Verified as **${username}** with catacombs level **${cataLevel}**!`));
                await sleep(15000)
                return message.delete()
            })
    },
};