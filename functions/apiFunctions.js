const axios = require('axios')
const { GuildMemberRoleManager } = require('discord.js')
const config = require('../data/config.json')

global.getUUID = async function getUUID(username) {
    try {
        var response = await axios.get(`https://api.mojang.com/users/profiles/minecraft/${username}`)
        if (!response.data.id) {
            return 'invalid player'
        }
        var uuid = response.data.id
        uuid = uuid.substr(0, 8) + "-" + uuid.substr(8, 4) + "-" + uuid.substr(12, 4) + "-" + uuid.substr(16, 4) + "-" + uuid.substr(20)
        return uuid
    } catch (error) {
        return 'invalid player'
    }
}
global.getIGN = async function getIGN(uuid) {
    try {
        response = await axios.get(`https://sessionserver.mojang.com/session/minecraft/profile/${uuid}`)
        return response.data.name
    } catch (error) {
        return 'invalid uuid'
    }
}

global.dungeoneering_xp = {
    0: 0,
    1: 50,
    2: 75,
    3: 110,
    4: 160,
    5: 230,
    6: 330,
    7: 470,
    8: 670,
    9: 950,
    10: 1340,
    11: 1890,
    12: 2665,
    13: 3760,
    14: 5260,
    15: 7380,
    16: 10300,
    17: 14400,
    18: 20000,
    19: 27600,
    20: 38000,
    21: 52500,
    22: 71500,
    23: 97000,
    24: 132000,
    25: 180000,
    26: 243000,
    27: 328000,
    28: 445000,
    29: 600000,
    30: 800000,
    31: 1065000,
    32: 1410000,
    33: 1900000,
    34: 2500000,
    35: 3300000,
    36: 4300000,
    37: 5600000,
    38: 7200000,
    39: 9200000,
    40: 12000000,
    41: 15000000,
    42: 19000000,
    43: 24000000,
    44: 30000000,
    45: 38000000,
    46: 48000000,
    47: 60000000,
    48: 75000000,
    49: 93000000,
    50: 116250000
}

global.getCataAndPb = async function (uuid) {
    let response = await HypixelApiRequest(`https://api.hypixel.net/skyblock/profiles?key=${config.minecraft.apiKey}&uuid=${uuid}`)
    if (response === "Api throttle") { return response; }
    response = response.data

    let highestCataXp = -1;
    let highestProfile = ""
    for (let i = 0; i < response.profiles.length; i++) {
        if (response.profiles[i].members[uuid].dungeons !== undefined) {
            if (response.profiles[i].members[uuid].dungeons.dungeon_types.catacombs.experience > highestCataXp) {
                highestCataXp = response.profiles[i].members[uuid].dungeons.dungeon_types.catacombs.experience;
                highestProfile = response.profiles[i];
            }
        }
    };
    if (highestProfile === "") { return "no dungeon data found" }
    let cataLevel = 0
    while (highestCataXp > dungeoneering_xp[cataLevel]) {
        cataLevel++
        highestCataXp = highestCataXp - dungeoneering_xp[cataLevel]
    }
    let dataJSON = {
        cataLevel: cataLevel
    }

    for (let i = 0; i <= 7; i++) {
        dataJSON["F" + i.toString()] = { "s": "No PB Found", "sPlus": "No PB Found" }

        if (highestProfile?.members[uuid]?.dungeons?.dungeon_types?.catacombs?.fastest_time_s[i] || null) {
            dataJSON["F" + i.toString()]["s"] = highestProfile.members[uuid].dungeons.dungeon_types.catacombs.fastest_time_s[i]
        }
        if (highestProfile?.members[uuid]?.dungeons?.dungeon_types?.catacombs?.fastest_time_s_plus[i] || null) {
            dataJSON["F" + i.toString()]["sPlus"] = highestProfile.members[uuid].dungeons.dungeon_types.catacombs.fastest_time_s_plus[i]
        }


        dataJSON["M" + i.toString()] = { "s": "No PB Found", "sPlus": "No PB Found" }

        if (highestProfile?.members[uuid]?.dungeons?.dungeon_types?.master_catacombs?.fastest_time_s[i] || null) {
            dataJSON["M" + i.toString()]["s"] = highestProfile.members[uuid].dungeons.dungeon_types.master_catacombs.fastest_time_s[i]
        }
        if (highestProfile?.members[uuid]?.dungeons?.dungeon_types?.master_catacombs?.fastest_time_s_plus[i] || null) {
            dataJSON["M" + i.toString()]["sPlus"] = highestProfile.members[uuid].dungeons.dungeon_types.master_catacombs.fastest_time_s_plus[i]
        }
    }
    return dataJSON
}

global.getSecretCountAndCata = async function(uuid) {
    let response = await HypixelApiRequest(`https://api.hypixel.net/player?key=${config.minecraft.apiKey}&uuid=${uuid}`)
    if (response === "Api throttle") { return response; }
    response = response.data

    return {
        "secretCount": response?.player?.achievements?.skyblock_treasure_hunter || 0,
        "cata": (response?.player?.achievements?.skyblock_dungeoneer || 0)-1
    }
}

global.fmtMStoMSS = function(millis) {
    var minutes = Math.floor(millis / 60000);
    var seconds = ((millis % 60000) / 1000).toFixed(0);
    return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
}

global.getDiscordFromPlayer = async function (uuid) {
    let response = await HypixelApiRequest(`https://api.hypixel.net/player?key=${config.minecraft.apiKey}&uuid=${uuid}`);
    if (response === "Api throttle") { return response; }
    return response?.data?.player?.socialMedia?.links?.DISCORD || "Player does not have a linked discord"
}

global.getPureHypixelResponse = async function (uuid) {
    let response = await HypixelApiRequest(`https://api.hypixel.net/skyblock/profiles?key=${config.minecraft.apiKey}&uuid=${uuid}`)
    if (response === "Api throttle") { return response; }
    return response.data
}

setInterval(() => {
    requestCount = 0
}, 60000);

global.requestCount = 0
global.HypixelApiRequest = async function (url, requestAdd = 1) {
    requestCount += requestAdd
    if (requestCount > 115) {
        return "Api throttle"
    }
    let response = await axios.get(url)
    return response
}