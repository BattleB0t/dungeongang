const Discord = require('discord.js')

module.exports = {
    name: 'update',
    aliases: [],
    usage: 'update [username]',
    description: 'Updates your catacombs level and emotes',
    hidden: false,
    async execute() {
        let message = messageParam, args = argsParam, config = configParam, fs = fsParam
        if (message.channel.id !== config.discord.update_channel && message.channel.id !== config.discord.staff_commands) { return; }
        message.delete()
        let verified = JSON.parse(fs.readFileSync('./data/verified.json'))
        let username
        let tag = message.member.user.tag
        let originalMessage = message
        if (!args[1]) {
            if (verified.user_ids.includes(message.member.id)) {
                username = await getIGN(verified.users[message.member.id].uuid)
            } else {
                try {
                    username = message.member.displayName;
                    username = username.split(" ")[1]
                    username = username.replace(/\W/g, '');
                } catch (error) {
                    return message.channel.sendError('An error has occurred while getting this user\'s username')
                }
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
                    return message.editError('This player does not exist!')
                }
                if (JSON.parse(fs.readFileSync('./data/banned.json')).users.includes(uuid)) {
                    return message.editError('You are banned from verifying!')
                }
                username = await getIGN(uuid)
                let data = await getSecretCountCataDiscord(uuid)
                    .catch(error => {
                        if(!error.isAxiosError) {
                            message.edit(createErrorEmbed(error))
                            throw error
                        }
                        console.log('axios error')
                        message.edit(createErrorEmbed(`(**${error.response.status}**) ${error.response.statusText}`))
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
                if(verified.user_ids.includes(originalMessage.author.id)){
                    try{
                        DiscordEmoji = originalMessage.member.getEmotes()
                        DiscordEmoji = DiscordEmoji.join('')
                    }catch(error){
                        console.log(error)
                        DiscordEmoji = ''
                    }
                } else {
                    verified.users[originalMessage.member.id] = {
                        "uuid": uuid,
                        "emotes": {
                            "unlocked_emotes": [],
                            "given_emotes": [],
                            "slots": {
                                "default": "none"
                            }
                        }
                    }
                    verified.user_ids.push(originalMessage.member.id)
                    fs.writeFileSync('./data/verified.json', JSON.stringify(verified, null, 2))
                }
                if (uuid !== verified.users[originalMessage.member.id].uuid) { verified.users[originalMessage.member.id].uuid = uuid }
                originalMessage.member.giveCorrectCataRole(cataLevel)
                let changeIntoName = `❮${cataLevel}❯ ${username} ${DiscordEmoji}`
                if (originalMessage.member.roles.cache.find(role => role.id === config.discord.staff_role)) {
                    Object.keys(config.discord.staff_ranks).forEach(rank => {
                        if (originalMessage.member.roles.cache.has(rank)) {
                            changeIntoName = changeIntoName.replace(/[❮❯]/g, config.discord.staff_ranks[rank])
                        }
                    })
                }
                try {
                    await originalMessage.member.setNickname(changeIntoName)
                } catch (e) { console.log(e) }

                // console.log(changeIntoName)
                message.edit(createSuccessEmbed(`Updated <@${originalMessage.member.id}> to catacombs level ${cataLevel}!`));
                await updateAvailableEmotes(originalMessage)
                await updateAvailableSlots(originalMessage)
                await sleep(15000)
                return message.delete()
            })
    },
};
