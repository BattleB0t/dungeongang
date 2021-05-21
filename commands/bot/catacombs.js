const Discord = require('discord.js')

module.exports = {
    name: 'catacombs',
    aliases: ['cata', 'c', 'check', 'dungeons', 'd'],
    usage: 'check [username]',
    description: 'Command to check if a player meets top player/top player+ requirements',
    async execute(message, args, config, fs) {
        let username;
        if (!message.member.roles.cache.has(config.discord.staff_role)) {
            return message.channel.send(createErrorEmbed('This command is not available to non-staff yet!'))
        }
        if (!args[1]) {
            try {
                username = message.member.displayName
                username = username.split(" ")[1]
                username = username.replace(/\W/g, '');
            } catch (error) {
                return message.channel.send(createErrorEmbed('An error has occurred while getting this user\'s username'))
            }
        } else if (message.mentions.members.first()) {
            try {
                username = message.mentions.members.first().displayName;
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
                let votedList = JSON.parse(fs.readFileSync('./data/votedout.json'))
                let clownList = JSON.parse(fs.readFileSync('./data/clowns.json'))
                let uuid = await getUUID(username)
                if (uuid == 'invalid player') {
                    return message.edit(createErrorEmbed('This player does not exist!'))
                }
                let IGN = await getIGN(uuid)
                if (IGN == 'invalid uuid') {
                    return message.edit(createErrorEmbed('An error has occurred while making the poll, please try again later.'))
                }
                let data = await getCataAndPb(uuid)
                    .catch(error => {
                        let errorMessage = error?.data?.cause || error.cause
                        return message.edit(createErrorEmbed(errorMessage))
                    })
                let secrets = getSecretCountCataDiscord(uuid)
                    .catch(error => {
                        let errorMessage = error?.data?.cause || error.cause
                        return message.edit(createErrorEmbed(errorMessage))
                    })
                if (data === "Api throttle") { return message.edit(createErrorEmbed("API Throttle: Please try again later.")) }
                if (secrets === "Api throttle") { return message.edit(createErrorEmbed("API Throttle: Please try again later.")) }
                let catacombs = data.cataLevel
                let master6 = data['M6'].s
                let floor7 = data['F7'].sPlus
                let secretsFound = secrets.secretCount
                let voted = false
                let clown = '<:no:838802013541498890>'
                let tp = '<:no:838802013541498890>'
                let tpp = '<:no:838802013541498890>'
                if (votedList.users.includes(uuid)) voted = true
                if (clownList.users.includes(uuid)) clown = '<:yes:838801988241588304>'
                if (!isNaN(catacombs)) {
                    if (catacombs >= 38 && secretsFound >= 12000 && floor7 <= 285000) {
                        tp = '<:yes:838801988241588304>'
                    }
                }
                if (!isNaN(catacombs)) {
                    if (catacombs >= 42 && secretsFound >= 20000 && voted == false) {
                        if (floor7 <= 250000) {
                            tpp = '<:yes:838801988241588304>'
                        }
                        if (master6 <= 240000) {
                            tpp = '<:yes:838801988241588304>'
                        }
                        if (tpp == '<:yes:838801988241588304>' && tp == '<:no:838802013541498890>') {
                            tpp = '<:no:838802013541498890>'
                        }
                    }
                }
                let checkEmbed = {
                    "color": 49151,
                    "author": {
                        "name": `Dungeon Data for ${IGN}`,
                        "url": `https://sky.shiiyu.moe/stats/${IGN}`,
                        "icon_url": `https://mc-heads.net/avatar/${uuid}`
                    },
                    "fields": [
                        {
                            "name": "**Catacombs Level**",
                            "value": `${catacombs}`
                        },
                        {
                            "name": "**Secrets**",
                            "value": `${secretsFound}`
                        },
                        {
                            "name": "**Floor 7 S+ PB**",
                            "value": `${fmtMStoMSS(floor7)}`
                        },
                        {
                            "name": "**Master 6 S+ PB**",
                            "value": `${fmtMStoMSS(master6)}`
                        },
                        {
                            "name": "**Voted-Out**",
                            "value": `${voted}`
                        },
                        {
                            "name": "**Qualifications**",
                            "value": `Top Player: ${tp}\nTop Player +: ${tpp}\nClown: ${clown}`
                        }
                    ]
                };
                return message.edit({ embed: checkEmbed });
            })
    },
};
