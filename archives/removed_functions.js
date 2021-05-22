global.findStats = async function findStats(uuid) {
    try {
        response = await HypixelApiRequest(`https://hypixel-api.senither.com/v1/profiles/${uuid}/weight?key=` + config.minecraft.apiKey, 2)
        if (response === "Api throttle") { return response; }
        var skillAverage = response?.data?.data?.skills?.average_skills?.toFixed(2) || "No Skill Data Found"
        var slayer = response?.data?.data?.slayers?.total_experience || "No Slayer Data Found"
        if (slayer == "No Slayer Data Found") {
            slayer = "No Slayer Data Found"
        } else {
            if (slayer >= 1000000) {
                slayer = (slayer / 1000000).toFixed(2) + 'M'
            } else if (slayer >= 1000 && slayer < 1000000) {
                slayer = (slayer / 1000).toFixed(2) + 'K'
            }
        }
        var zombieSlayer = response?.data?.data?.slayers?.bosses?.revenant?.experience || "No Slayer Data Found"
        if (zombieSlayer == "No Slayer Data Found") {
            zombieSlayer = "No Slayer Data Found"
        } else {
            if (zombieSlayer >= 1000000) {
                zombieSlayer = (zombieSlayer / 1000000).toFixed(2) + 'M'
            } else if (zombieSlayer >= 1000 && zombieSlayer < 1000000) {
                zombieSlayer = (zombieSlayer / 1000).toFixed(2) + 'K'
            }
        }
        var taraSlayer = response?.data?.data?.slayers?.bosses?.tarantula?.experience || "No Slayer Data Found"
        if (taraSlayer == "No Slayer Data Found") {
            taraSlayer = "No Slayer Data Found"
        } else {
            if (taraSlayer >= 1000000) {
                taraSlayer = (taraSlayer / 1000000).toFixed(2) + 'M'
            } else if (taraSlayer >= 1000 && taraSlayer < 1000000) {
                taraSlayer = (taraSlayer / 1000).toFixed(2) + 'K'
            }
        }
        var wolfSlayer = response?.data?.data?.slayers?.bosses?.sven?.experience || "No Slayer Data Found"
        if (wolfSlayer = "No Slayer Data Found") {
            wolfSlayer = "No Slayer Data Found"
        } else {
            if (wolfSlayer >= 1000000) {
                wolfSlayer = (wolfSlayer / 1000000).toFixed(2) + 'M'
            } else if (wolfSlayer >= 1000 && wolfSlayer < 1000000) {
                wolfSlayer = (wolfSlayer / 1000).toFixed(2) + 'K'
            }
        }
        var cataLevel = response?.data?.data?.dungeons?.types?.catacombs?.level.toFixed(2) || "No Dungeon Data Found"
        var selectedClass = response?.data?.data?.dungeons?.selected_class?.charAt(0)?.toUpperCase() + response?.data?.data?.dungeons?.selected_class?.slice(1) || "No Dungeon Data Found"
        var fastestTimeSeconds = response?.data?.data?.dungeons?.types?.catacombs?.fastest_time_s_plus?.tier_7?.seconds?.toFixed(0) || "No PB Found"
        if (fastestTimeSeconds == "No PB Found") {
            fastestTimeMS = "No PB Found"
            fastestTime = "No PB Found"
        } else {
            fastestTimeMS = fastestTimeSeconds * 1000
            fastestTime = fmtMSS(fastestTimeSeconds)
        }
        var dungeonWeight = response?.data?.data?.dungeons?.weight?.toFixed(2) || "No Weight Data Found"
        var secretsFound = response?.data?.data?.dungeons?.secrets_found?.toFixed(0) || "No Dungeon Data Found"
        var foraging = response?.data?.data?.skills?.foraging?.level?.toFixed(2) || "No Skill Data Found"
        var enchanting = response?.data?.data?.skills?.enchanting?.level?.toFixed(2) || "No Skill Data Found"
        var farming = response?.data?.data?.skills?.farming?.level?.toFixed(2) || "No Skill Data Found"
        var combat = response?.data?.data?.skills?.combat?.level?.toFixed(2) || "No Skill Data Found"
        var fishing = response?.data?.data?.skills?.fishing?.level?.toFixed(2) || "No Skill Data Found"
        var alchemy = response?.data?.data?.skills?.alchemy?.level?.toFixed(2) || "No Skill Data Found"
        var taming = response?.data?.data?.skills?.taming?.level?.toFixed(2) || "No Skill Data Found"
        var carpentry = response?.data?.data?.skills?.carpentry?.level?.toFixed(2) || "No Skill Data Found"
        var runecrafting = response?.data?.data?.skills?.runecrafting?.level?.toFixed(2) || "No Skill Data Found"
        var weight = response?.data?.data?.weight?.toFixed(2) || "No Weight Data Found"
        var weightOverflow = response?.data?.data?.weight_overflow?.toFixed(2) || "No Weight Data Found"
        var skillWeight = response?.data?.data?.skills?.weight?.toFixed(2) || "No Weight Data Found"
        var slayerWeight = response?.data?.data?.slayers?.weight?.toFixed(2) || "No Weight Data Found"
        var totalWeight = response?.data?.data?.weight + response?.data?.data?.weight_overflow || "No Weight Data Found"
        var profileID = response?.data?.data?.id || "No Profile ID Found"
        if (totalWeight == "No Weight Data Found") {
            totalWeight = "No Weight Data Found"
        } else {
            totalWeight = totalWeight.toFixed(2)
        }
        var stats = {}
        stats.skillAverage = skillAverage
        stats.foraging = foraging
        stats.enchanting = enchanting
        stats.farming = farming
        stats.combat = combat
        stats.fishing = fishing
        stats.alchemy = alchemy
        stats.taming = taming
        stats.carpentry = carpentry
        stats.runecrafting = runecrafting
        stats.slayer = slayer
        stats.catacombs = cataLevel
        stats.selectedClass = selectedClass
        stats.secretsFound = secretsFound
        stats.fastestTime = fastestTime
        stats.fastestTimeMS = fastestTimeMS
        stats.zombieSlayer = zombieSlayer
        stats.taraSlayer = taraSlayer
        stats.wolfSlayer = wolfSlayer
        stats.weight = weight
        stats.weightOverflow = weightOverflow
        stats.skillWeight = skillWeight
        stats.slayerWeight = slayerWeight
        stats.dungeonWeight = dungeonWeight
        stats.totalWeight = totalWeight
        stats.profileID = profileID
        return stats
    } catch (error) {
        return ['error', handleSenitherError(error, await getIGN(uuid))]
    }
}

global.handleSenitherError = function HandleError(error, username) {
    let status = error?.response?.data?.status || error.reponse.status
    switch (status) {
        case 403:
            return 'The API key in the config.json file is invalid.'
        case 404:
            return `${username} has no SkyBlock profiles.`
        case 429:
            return 'This API key has reached the rate-limit, please try again later.'
        case 500:
            return 'An internal error occurred in the API, or the Hypixel API responded with an unknown error code.'
        case 502:
            return 'The Hypixel API is currently down, please try again later.'
        case 503:
            return 'The Hypixel API is currently under maintenance, please try again later.'
        default:
            console.log(error)
            return 'An unknown error has occurred with the error code: ' + status + ', please contact nick#0404 for more help.'
    }
}

.catch(error => {
    console.log('PPPP: ', error)
    if(!error.data.isAxiosError) return message.edit(createErrorEmbed(error))
    console.log('Not axios error')
    let errorMessage = error?.data?.cause || error.cause
    return message.edit(createErrorEmbed(errorMessage))
})