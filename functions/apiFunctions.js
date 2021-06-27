const axios = require('axios')
const { GuildMemberRoleManager } = require('discord.js')
const config = require('../data/config.json')

globalThis.getUUID = async function getUUID(username) {
    try {
        var response = await axios.get(`https://api.mojang.com/users/profiles/minecraft/${username}`)
        if (!response.data.id) {
            return 'invalid player'
        }
        var uuid = response.data.id
        return uuid
    } catch (error) {
        return 'invalid player'
    }
}
globalThis.getIGN = async function getIGN(uuid) {
    try {
        response = await axios.get(`https://sessionserver.mojang.com/session/minecraft/profile/${uuid}`)
        return response.data.name
    } catch (error) {
        return 'invalid uuid'
    }
}

globalThis.dungeoneering_xp = {
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

let dungeon_xp = [
    [0, 0],
    [1, 50],
    [2, 125],
    [3, 235],
    [4, 395],
    [5, 625],
    [6, 955],
    [7, 1425],
    [8, 2095],
    [9, 3045],
    [10, 4385],
    [11, 6275],
    [12, 8940],
    [13, 12700],
    [14, 17960],
    [15, 25340],
    [16, 35640],
    [17, 50040],
    [18, 70040],
    [19, 97640],
    [20, 135640],
    [21, 188140],
    [22, 259640],
    [23, 356640],
    [24, 488640],
    [25, 668640],
    [26, 911640],
    [27, 1239640],
    [28, 1684640],
    [29, 2284640],
    [30, 3084640],
    [31, 4149640],
    [32, 5559640],
    [33, 7459640],
    [34, 9959640],
    [35, 13259640],
    [36, 17559640],
    [37, 23159640],
    [38, 30359640],
    [39, 39559640],
    [40, 51559640],
    [41, 66559640],
    [42, 85559640],
    [43, 109559640],
    [44, 139559640],
    [45, 177559640],
    [46, 225559640],
    [47, 285559640],
    [48, 360559640],
    [49, 453559640],
    [50, 569809640],
    [51, 708815308],
    [52, 878166305],
    [53, 1083705521],
    [54, 1332256501],
    [55, 1631764764],
    [56, 1991456278],
    [57, 2422014775],
    [58, 2935779757],
    [59, 3546967162],
    [60, 4271914829],
    [61, 1000000000000]
]

function getDungeonLevel(xp) {
    var level = 0
    var percentage = 0.0
    for (var i = 0; i < dungeon_xp.length; i++) {
        if (dungeon_xp[i][1] > xp) {
            level = dungeon_xp[i][0]
            a = xp - dungeon_xp[i - 1][1]
            b = dungeon_xp[i][1] - dungeon_xp[i - 1][1]
            percentage = a / b
            break;
        }

    }
    return level + percentage - 1;
}

globalThis.getCataAndPb = async function (uuid) {
    let response = await HypixelApiRequest(`https://api.hypixel.net/skyblock/profiles?key=${config.minecraft.apiKey}&uuid=${uuid}`)
    if (response === "Api throttle") { return response; }
    response = response.data

    let highestCataXp = -1;
    let highestProfile = ""
    if (response.profiles == null) throw new Error(await getIGN(uuid) + ' has no SkyBlock profiles.')
    for (let i = 0; i < response.profiles.length; i++) {
        if (response.profiles[i].members[uuid].dungeons !== undefined) {
            if (response.profiles[i].members[uuid].dungeons.dungeon_types.catacombs.experience > highestCataXp) {
                highestCataXp = response.profiles[i].members[uuid].dungeons.dungeon_types.catacombs.experience;
                highestProfile = response.profiles[i];
            }
        }
    };
    if (highestProfile === "") return {
        cataLevel: getLevelByXp(highestCataXp),
        F0: { s: 'No PB Found', sPlus: 'No PB Found' },
        M0: { s: 'No PB Found', sPlus: 'No PB Found' },
        F1: { s: 'No PB Found', sPlus: 'No PB Found' },
        M1: { s: 'No PB Found', sPlus: 'No PB Found7' },
        F2: { s: 'No PB Found', sPlus: 'No PB Found' },
        M2: { s: 'No PB Found', sPlus: 'No PB Found' },
        F3: { s: 'No PB Found', sPlus: 'No PB Found' },
        M3: { s: 'No PB Found', sPlus: 'No PB Found' },
        F4: { s: 'No PB Found', sPlus: 'No PB Found' },
        M4: { s: 'No PB Found', sPlus: 'No PB Found' },
        F5: { s: 'No PB Found', sPlus: 'No PB Found' },
        M5: { s: 'No PB Found', sPlus: 'No PB Found' },
        F6: { s: 'No PB Found', sPlus: 'No PB Found' },
        M6: { s: 'No PB Found', sPlus: 'No PB Found' },
        F7: { s: 'No PB Found', sPlus: 'No PB Found' },
        M7: { s: 'No PB Found', sPlus: 'No PB Found' }
    }
    let cataLevel = getDungeonLevel(highestCataXp)
    let dataJSON = {
        cataLevel: cataLevel.toFixed(2)
    }
    for (let i = 0; i <= 7; i++) {
        dataJSON["F" + i.toString()] = { "s": "No PB Found", "sPlus": "No PB Found" }

        if (highestProfile?.members[uuid]?.dungeons?.dungeon_types?.catacombs?.fastest_time_s?.[i] || null) {
            dataJSON["F" + i.toString()]["s"] = highestProfile.members[uuid].dungeons.dungeon_types.catacombs.fastest_time_s[i]
        }
        if (highestProfile?.members[uuid]?.dungeons?.dungeon_types?.catacombs?.fastest_time_s_plus?.[i] || null) {
            dataJSON["F" + i.toString()]["sPlus"] = highestProfile.members[uuid].dungeons.dungeon_types.catacombs.fastest_time_s_plus[i]
        }


        dataJSON["M" + i.toString()] = { "s": "No PB Found", "sPlus": "No PB Found" }

        if (highestProfile?.members[uuid]?.dungeons?.dungeon_types?.master_catacombs?.fastest_time_s?.[i] || null) {
            dataJSON["M" + i.toString()]["s"] = highestProfile.members[uuid].dungeons.dungeon_types.master_catacombs.fastest_time_s[i]
        }
        if (highestProfile?.members[uuid]?.dungeons?.dungeon_types?.master_catacombs?.fastest_time_s_plus?.[i] || null) {
            dataJSON["M" + i.toString()]["sPlus"] = highestProfile.members[uuid].dungeons.dungeon_types.master_catacombs.fastest_time_s_plus[i]
        }
    }
    return dataJSON
}

globalThis.getSecretCountCataDiscord = async function (uuid) {
    let response = await HypixelApiRequest(`https://api.hypixel.net/player?key=${config.minecraft.apiKey}&uuid=${uuid}`)
    if (response === "Api throttle") { return response; }
    response = response.data

    return {
        "secretCount": response?.player?.achievements?.skyblock_treasure_hunter || 0,
        "cata": response?.player?.achievements?.skyblock_dungeoneer || 0,
        "discord": response?.player?.socialMedia?.links?.DISCORD || "Player does not have a linked discord"
    }
}

globalThis.fmtMStoMSS = function (millis) {
    var minutes = Math.floor(millis / 60000);
    var seconds = ((millis % 60000) / 1000).toFixed(0);
    return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
}

globalThis.getDiscordFromPlayer = async function (uuid) {
    let response = await HypixelApiRequest(`https://api.hypixel.net/player?key=${config.minecraft.apiKey}&uuid=${uuid}`);
    if (response === "Api throttle") { return response; }
    return response?.data?.player?.socialMedia?.links?.DISCORD || "Player does not have a linked discord"
}

globalThis.getPureHypixelResponse = async function (uuid) {
    let response = await HypixelApiRequest(`https://api.hypixel.net/skyblock/profiles?key=${config.minecraft.apiKey}&uuid=${uuid}`)
    if (response === "Api throttle") { return response; }
    return response.data
}

setInterval(() => {
    requestCount = 0
}, 60000);

globalThis.requestCount = 0
globalThis.HypixelApiRequest = async function (url, requestAdd = 1) {
    requestCount += requestAdd
    if (requestCount > 115) {
        return "Api throttle"
    }
    let response = await axios.get(url)
    return response
}