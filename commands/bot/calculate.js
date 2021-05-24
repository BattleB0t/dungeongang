const Discord = require('discord.js')

let dungeoneering_xp = {
    0: 0,
    1: 50,
    2: 125,
    3: 235,
    4: 395,
    5: 625,
    6: 955,
    7: 1425,
    8: 2095,
    9: 3045,
    10: 4385,
    11: 6275,
    12: 8940,
    13: 12700,
    14: 17960,
    15: 25340,
    16: 35640,
    17: 50040,
    18: 70040,
    19: 97640,
    20: 135640,
    21: 188140,
    22: 259640,
    23: 356640,
    24: 488640,
    25: 668640,
    26: 911640,
    27: 1239640,
    28: 1684640,
    29: 2284640,
    30: 3084640,
    31: 4149640,
    32: 5559640,
    33: 7459640,
    34: 9959640,
    35: 13259640,
    36: 17559640,
    37: 23159640,
    38: 30359640,
    39: 39559640,
    40: 51559640,
    41: 66559640,
    42: 85559640,
    43: 109559640,
    44: 139559640,
    45: 177559640,
    46: 225559640,
    47: 285559640,
    48: 360559640,
    49: 453559640,
    50: 569809640
}
function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

module.exports = {
    name: 'calculate',
    aliases: ['calc'],
    usage: 'calculate level',
    description: 'Calculates xp required for the catacombs levels specified',
    async execute(message, args, config, fs) {
        if (args.length > 2) {
            args[1] = parseInt(args[1])
            args[2] = parseInt(args[2])
            if (Number.isNaN(args[1]) || Number.isNaN(args[2])) {
                return message.channel.send(createErrorEmbed(`Please provide valid catacombs levels`))
            }
            if (args[1] > 50 || args[1] < 0 || args[2] > 50 || args[2] < 0) {
                return message.channel.send(createErrorEmbed(`Please provide valid catacombs levels`))
            }
            if (args[1] > args[2]) {
                let temp = args[1]
                args[1] = args[2]
                args[2] = temp
            }
            let sum = dungeoneering_xp[args[2]] - dungeoneering_xp[args[1]]
            sum = numberWithCommas(sum)
            return message.channel.send(createSuccessEmbed(`It will take **${sum}** catacombs xp to get from level **${args[1]}** to level **${args[2]}**`))
        } else if (args.length === 2) {
            args[1] = parseInt(args[1])
            if (Number.isNaN(args[1])) {
                return message.channel.send(createErrorEmbed(`Please provide valid catacombs levels`))
            }
            if (args[1] > 50 || args[1] < 0) {
                return message.channel.send(createErrorEmbed(`Please provide valid catacombs levels`))
            }
            let username = message.member.displayName;
            username = username.split(" ")[1]
            username = username.replace(/\W/g, '');
            let uuid = await getUUID(username)
            message.channel.send(
                new Discord.MessageEmbed()
                    .setColor('0x00bfff')
                    .setDescription('Grabbing data from API...')
            )
                .then(async newMessage => {
                    let response = await getPureHypixelResponse(uuid)
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
                    if (response === "Api throttle") { return message.edit(createErrorEmbed("API Throttle: Please try again later.")) }
                    let cataXp = -1;
                    try{
                        var profiles = response.profiles.length
                    }catch(error){
                        if(!error.isAxiosError) {
                            newMessage.edit(createErrorEmbed(error))
                            throw error
                        }
                        console.log('axios error')
                        let errorMessage = error.response.data.cause
                        newMessage.edit(createErrorEmbed(errorMessage))
                        throw error
                    }
                    for (let i = 0; i < profiles; i++) {
                        if (response?.profiles[i]?.members[uuid]?.dungeons || false) {
                            if (response.profiles[i].members[uuid].dungeons.dungeon_types.catacombs.experience > cataXp) {
                                cataXp = response.profiles[i].members[uuid].dungeons.dungeon_types.catacombs.experience;
                            }
                        }
                    };
                    cataXp = Math.floor(cataXp)
                    collectiveXp = dungeoneering_xp[args[1]] - cataXp

                    if (collectiveXp < 0) {
                        return newMessage.edit(createErrorEmbed(`You have already reached this catacombs level!`))
                    }
                    collectiveXp = numberWithCommas(collectiveXp)

                    return newMessage.edit(createSuccessEmbed(`It will take you **${collectiveXp}** catacombs xp to reach level **${args[1]}**`))
                })
        } else {
            return message.channel.send(createErrorEmbed(`Please provide at least one catacombs level`))
        }
    },
};
