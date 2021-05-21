const Discord = require('discord.js')

module.exports = {
    name: 'check',
    aliases: ['c'],
    usage: 'check [user]',
    description: 'Command to check if a player meets top player/top player+ requirements',
    async execute(message, args, config, fs) {
        var username;
        if (!message.member.roles.cache.has(config.discord.staff_role)) {
            return message.channel.send(createErrorEmbed('You do not have permission to use this command!'))
        }
        if (!args[1]) {
            return message.channel.send(createErrorEmbed('No username provided.'))
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
                if (await getUUID(username) == 'invalid player') {
                    return message.edit(createErrorEmbed('This player does not exist!'))
                }
                let uuid = await getUUID(username)
                if (await getIGN(uuid) == 'invalid uuid') {
                    return message.edit(createErrorEmbed('An error has occurred while making the poll, please try again later.'))
                }
                let IGN = await getIGN(uuid)
                let data = await findStats(uuid)
                if (data === "Api throttle") { return message.edit(createErrorEmbed("Api throttle")) }
                if (data[0] == 'error') {
                    data.shift()
                    return message.edit(createErrorEmbed(data.toString()))
                }
                let master = await getMaster(data.profileID, uuid)
                if (master == 'No PB Found') master.masterPB = 'No PB Found'
                let voted = false
                let clown = '<:no:838802013541498890>'
                let tp = '<:no:838802013541498890>'
                let tpp = '<:no:838802013541498890>'
                if (votedList.users.includes(uuid)) voted = true
                if (clownList.users.includes(uuid)) clown = '<:yes:838801988241588304>'
                if (!isNaN(data.catacombs)) {
                    if (data.catacombs >= 38 && data.secretsFound >= 12000 && data.fastestTimeMS <= 285000) {
                        tp = '<:yes:838801988241588304>'
                    }
                }
                if (!isNaN(data.catacombs)) {
                    if (data.catacombs >= 42 && data.secretsFound >= 20000 && voted == false) {
                        if (data.fastestTimeMS <= 250000) {
                            tpp = '<:yes:838801988241588304>'
                        }
                        if (master.masterPBSeconds <= 240000) {
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
                        "name": `Check Results for ${IGN}`,
                        "url": `https://sky.shiiyu.moe/stats/${IGN}`,
                        "icon_url": `https://mc-heads.net/avatar/${uuid}`
                    },
                    "fields": [
                        {
                            "name": "**Catacombs Level**",
                            "value": `${data.catacombs}`
                        },
                        {
                            "name": "**Secrets**",
                            "value": `${data.secretsFound}`
                        },
                        {
                            "name": "**Floor 7 S+ PB**",
                            "value": `${data.fastestTime}`
                        },
                        {
                            "name": "**Master 6 S+ PB**",
                            "value": `${master.masterPB}`
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
