const Discord = require('discord.js')

module.exports = {
    name: 'uupdate',
    aliases: [],
    usage: 'update [username]',
    description: 'Updates your catacombs level and emotes',
    async execute(message, args, config, fs) {
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
                let data = await getSecretCountCataDiscord(uuid)
                    .catch(error => {
                        if(!error.isAxiosError) {
                            message.edit(createErrorEmbed(error))
                            throw error
                        }
                        console.log('axios error')
                        let errorMessage = error.response.data.cause
                        message.edit(createErrorEmbed(errorMessage))
                        throw error
                    })
                let catacombs = await getCataAndPb(uuid)
                    .catch(error => {
                        if(!error.isAxiosError) {
                            message.edit(createErrorEmbed(error))
                            throw error
                        }
                        console.log('axios error')
                        let errorMessage = error.response.data.cause
                        message.edit(createErrorEmbed(errorMessage))
                        throw error
                    })
                let linkedDiscord = data.discord
                // console.log(linkedDiscord)
                if (linkedDiscord === "Api throttle") { return message.editError('API Throttle: Please try again later.') }
                if (linkedDiscord == "Player does not have a linked discord") {
                    return message.editError('You must link your discord in hypixel!')
                } else if (linkedDiscord != tag) {
                    // console.log(linkedDiscord)
                    // console.log(tag)
                    return message.editError('That minecraft account is connected to a different discord!')
                }
                let cataLevel = catacombs.cataLevel
                cataLevel = parseInt(cataLevel).toFixed(0)
                let DiscordEmoji = originalMessage.member.displayName.split(" ")
                DiscordEmoji.splice(0, 2)
                DiscordEmoji = DiscordEmoji.join(" ")
                // console.log(`❮${cataLevel}❯ ${username} ${DiscordEmoji}`)
                if (originalMessage.member.roles.cache.find(role => role.id === config.discord.tpPlus_role)) {
                    if (originalMessage.member.roles.cache.find(role => role.id === config.discord.subFour_role)) {
                        if (!DiscordEmoji.includes("⭐")) {
                            if (DiscordEmoji.includes("★")) {
                                DiscordEmoji = DiscordEmoji.substring(0, DiscordEmoji.indexOf("★")) + DiscordEmoji.substring(DiscordEmoji.indexOf("★") + 2)
                            }
                            DiscordEmoji = "⭐ " + DiscordEmoji
                        }
                    } else if (!DiscordEmoji.includes("★")) {
                        if (DiscordEmoji.includes("⭐")) {
                            DiscordEmoji = DiscordEmoji.substring(0, DiscordEmoji.indexOf("⭐")) + DiscordEmoji.substring(DiscordEmoji.indexOf("⭐") + 2)
                        }
                        DiscordEmoji = "★ " + DiscordEmoji
                    }
                } else {
                    if (DiscordEmoji.includes("★")) {
                        DiscordEmoji = DiscordEmoji.substring(0, DiscordEmoji.indexOf("★")) + DiscordEmoji.substring(DiscordEmoji.indexOf("★") + 2)
                    }
                    if (DiscordEmoji.includes("⭐")) {
                        DiscordEmoji = DiscordEmoji.substring(0, DiscordEmoji.indexOf("⭐")) + DiscordEmoji.substring(DiscordEmoji.indexOf("⭐") + 2)
                    }
                }
                // let discordCollection = new Discord.Collection()
                // discordCollection.concat
                originalMessage.member.giveCorrectCataRole(cataLevel)
                let changeIntoName = `❮${cataLevel}❯ ${username} ${DiscordEmoji}`
                if (originalMessage.member.roles.cache.find(role => role.id === config.discord.staff_role)) {
                    Object.keys(config.discord.staff_ranks).forEach(rank => {
                        if (originalMessage.member.roles.cache.has(rank)) {
                            // console.log(1)
                            changeIntoName = changeIntoName.replace(/[❮❯]/g, config.discord.staff_ranks[rank])
                        }
                    })
                }
                try {
                    await originalMessage.member.setNickname(changeIntoName)
                } catch (e) { console.log(e) }
                
                // console.log(changeIntoName)
                message.edit(createSuccessEmbed(`Updated <@${originalMessage.member.id}> to catacombs level ${cataLevel}!`));
                await sleep(15000)
                return message.delete()
            })
    },
};
