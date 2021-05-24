const Discord = require('discord.js');

module.exports = {
    name: 'forceupdate',
    aliases: [],
    usage: 'forceupdate <@person> [username]',
    description: 'Force updates a person\'s catacombs level and emotes (staff only)',
    async execute(message, args, config, fs) {
        if (!message.member.roles.cache.has(config.discord.staff_role)) {
            return message.channel.send(createErrorEmbed('You do not have permission to use this command!'))
        }
        message.delete()
        let verified = JSON.parse(fs.readFileSync('./data/verified.json'))
        let username
        let tag = message.mentions.members.first().user.tag
        let originalMessage = message
        if (!args[2]) {
            try {
                username = message.mentions.members.first().displayName;
                username = username.split(" ")[1]
                username = username.replace(/\W/g, '');
            } catch (error) {
                return message.channel.sendError('An error has occurred while getting this user\'s username')
            }
        } else {
            username = args[2];
        }
        return message.channel.send(
            new Discord.MessageEmbed()
                .setColor('0x00bfff')
                .setDescription('Grabbing data from API...')
        )
            .then(async message => {
                let uuid = await getUUID(username)
                if (uuid == 'invalid player') {
                    return message.editError('This player does not exist!')
                }
                username = await getIGN(uuid)
                let data = await getSecretCountCataDiscord(uuid)
                    .catch(error => {
                        if (!error.isAxiosError) {
                            message.edit(createErrorEmbed(error))
                            throw error
                        }
                        console.log('axios error')
                        let errorMessage = error.response.data.cause
                        message.edit(createErrorEmbed(errorMessage))
                        throw error
                    })
                let cataLevel = 0
                let catacombs = await getCataAndPb(uuid)
                    .catch(error => {
                        cataLevel = undefined
                    })
                let linkedDiscord = data.discord
                if (linkedDiscord === "Api throttle") { return message.editError('API Throttle: Please try again later.') }
                if (linkedDiscord == "Player does not have a linked discord") {
                    return message.editError('You must link your discord in hypixel!')
                } else if (linkedDiscord != tag) {
                    return message.editError('That minecraft account is connected to a different discord!')
                }
                if(cataLevel === undefined){
                    cataLevel = 0
                }else{
                    cataLevel = catacombs.cataLevel
                }
                cataLevel = parseInt(cataLevel).toFixed(0)
                let DiscordEmoji = ''
                if (verified.user_ids.includes(originalMessage.mentions.members.first().user.id)) {
                    try {
                        DiscordEmoji = originalMessage.mentions.members.first().getEmotes()
                        DiscordEmoji = DiscordEmoji.join('')
                    } catch (error) {
                        console.log(error)
                        DiscordEmoji = ''
                    }
                } else {
                    verified.users[originalMessage.mentions.members.first().id] = {
                        "uuid": uuid,
                        "emotes": {
                            "unlocked_emotes": [],
                            "given_emotes": [],
                            "slots": {
                                "default": "none"
                            }
                        }
                    }
                    verified.user_ids.push(originalMessage.mentions.members.first().id)
                    fs.writeFileSync('./data/verified.json', JSON.stringify(verified, null, 2))
                }
                if (verified.users[originalMessage.mentions.members.first().id] !== undefined) {
                    if (uuid !== verified.users[originalMessage.mentions.members.first().id].uuid) { verified.users[originalMessage.mentions.members.first().id].uuid = uuid }
                }
                originalMessage.mentions.members.first().giveCorrectCataRole(cataLevel)
                let changeIntoName = `❮${cataLevel}❯ ${username} ${DiscordEmoji}`
                if (originalMessage.mentions.members.first().roles.cache.find(role => role.id === config.discord.staff_role)) {
                    Object.keys(config.discord.staff_ranks).forEach(rank => {
                        if (originalMessage.mentions.members.first().roles.cache.has(rank)) {
                            changeIntoName = changeIntoName.replace(/[❮❯]/g, config.discord.staff_ranks[rank])
                        }
                    })
                }
                try {
                    await originalMessage.mentions.members.first().setNickname(changeIntoName)
                } catch (e) { console.log(e) }

                // console.log(changeIntoName)
                message.edit(createSuccessEmbed(`Updated <@${originalMessage.mentions.members.first().id}> to catacombs level ${cataLevel}!`));
                await sleep(15000)
                return message.delete()
            })
    },
};
