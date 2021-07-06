const Discord = require('discord.js')


module.exports = {
    name: 'verify',
    aliases: [],
    usage: 'verify [username]',
    description: 'Verifies and links your minecraft account to your discord account',
    hidden: false,
    async execute() {
        let message = messageParam, args = argsParam, config = configParam, fs = fsParam
        if (message.channel.id !== config.discord.verification_channel && message.channel.id !== config.discord.staff_commands) { return; }
        let verified = JSON.parse(fs.readFileSync('./data/verified.json'))
        message.delete()
        let tag = message.member.user.tag
        let username
        let originalMessage = message
        if (!args[1]) {
            return message.channel.sendError('invalid usage, do -verify [IGN]')
        }
        if (message.member.roles.cache.find(r => r.id === config.discord.member_role) && verified.user_ids.includes(message.author.id)) {
            return message.channel.sendError('You are already verified!')
        }
        username = args[1];
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
                let catacombs = await getCataAndPb(uuid)
                    .catch(error => {
                        if(!error.isAxiosError) {
                            message.edit(createErrorEmbed(error))
                            throw error
                        }
                        console.log('axios error')
                        message.edit(createErrorEmbed(`(**${error.response.status}**) ${error.response.statusText}`))
                        throw error
                    })
                let linkedDiscord = data.discord
                if (linkedDiscord == "Player does not have a linked discord") {
                    return message.editError('You must link your discord in hypixel!')
                } else if (linkedDiscord != tag) {
                    return message.editError('That minecraft account is connected to a different discord!')
                }
                let cataLevel = catacombs.cataLevel
                cataLevel = Math.floor(parseInt(cataLevel))
                let changeIntoName = `❮${cataLevel}❯ ${username}`
                if (originalMessage.member.roles.cache.find(role => role.id === config.discord.staff_role)) {
                    Object.keys(config.discord.staff_ranks).forEach(rank => {
                        if (originalMessage.member.roles.cache.has(rank)) {
                            changeIntoName = changeIntoName.replace(/[❮❯]/g, config.discord.staff_ranks[rank])
                        }
                    })
                }
                originalMessage.member.giveCorrectCataRole(cataLevel)
                if (verified.user_ids.includes(originalMessage.member.id)) {
                    message.edit(createSuccessEmbed('You are already verified, giving member role...'))
                    try {
                        await originalMessage.member.setNickname(changeIntoName)
                    } catch (e) { console.log(e) }
                    console.log(config.discord.member_role)
                    await originalMessage.member.roles.add(config.discord.member_role)
                    return;
                }
                try {
                    await originalMessage.member.setNickname(changeIntoName)
                } catch (e) { console.log(e) }
                await originalMessage.member.roles.add(config.discord.member_role)
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
                message.edit(createSuccessEmbed(`Verified as **${username}** with catacombs level **${cataLevel}**!`));
                await updateAvailableEmotes(originalMessage)
                await updateAvailableSlots(originalMessage)
                await sleep(15000)
                return message.delete()
            })
    },
};