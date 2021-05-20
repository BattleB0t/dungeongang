let methods = {}

const Discord = require('discord.js')

methods.updateUser = async function (message, tag, args, config, fs) {
    return;
    let username
    let originalMessage = message
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
    // console.log(username)
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
                // console.log(linkedDiscord)
                // console.log(tag)
                return message.edit(createErrorEmbed('That minecraft account is connected to a different discord!'))
            }
            let cataLevel = Math.floor(data.catacombs)
            let DiscordEmoji = originalMessage.member.displayName.split(" ")
            DiscordEmoji.splice(0, 2)
            DiscordEmoji = DiscordEmoji.join(" ")
            // console.log(`❮${cataLevel}❯ ${username} ${DiscordEmoji}`)
            if (originalMessage.member.roles.cache.find(role => role.id === config.discord.tpPlus_role)) {
                if (originalMessage.member.roles.cache.find(role => role.id === config.discord.subFour_role)) {
                    if (!DiscordEmoji.includes("⭐")) {
                        DiscordEmoji = "⭐ " + DiscordEmoji
                    }
                } else if (!DiscordEmoji.includes("★")) {
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
            originalMessage.member.removeAllCataRoles()
            if (cataLevel > 29) {
                if (cataLevel < 35) {
                    originalMessage.member.roles.add(config.discord.cata_roles["30+"])
                } else {
                    if (originalMessage.member.roles.cache.find(role => role.id === config.discord.normalTp_role) && cataLevel > 37) {
                        originalMessage.member.roles.add(config.discord.cata_roles[cataLevel.toString()])
                    } else {
                        originalMessage.member.roles.add(config.discord.cata_roles["35+"])
                    }
                }
            }
            try {
                await originalMessage.member.setNickname(`❮${cataLevel}❯ ${username} ${DiscordEmoji}`)
            } catch (e) { console.log(e) }
            // console.log(`❮${cataLevel}❯ ${username} ${DiscordEmoji}`)
            return message.edit(createSuccessEmbed(`Updated <@${originalMessage.member.id}> to catacombs level ${cataLevel}!`));

        })
}

exports.data = methods