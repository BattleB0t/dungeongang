module.exports = {
    name: 'emotes',
    aliases: [],
    usage: 'emotes',
    description: 'See the emojis that a you have',
    async execute() {
        let message = messageParam, args = argsParam, config = configParam, fs = fsParam
        let verified = JSON.parse(fs.readFileSync('./data/verified.json'))
        if(args.length == 1){
            if(!verified.user_ids.includes(message.author.id)) return message.channel.send(createErrorEmbed(`This user has not yet verified with Dungeon Gang v2! \n Verify by doing -update in <#${config.discord.update_channel}>`))
            await updateAvailableEmotes(message)
            await updateAvailableSlots(message)
            let emotes = JSON.parse(fs.readFileSync('./data/verified.json'))
            let unlocked = emotes.users[message.author.id].emotes.unlocked_emotes
            let given = emotes.users[message.author.id].emotes.given_emotes
            let availableEmotes = unlocked.concat(given);
            availableEmotes = availableEmotes.removeDuplicates()
            return message.channel.send(await createEmoteEmbed(availableEmotes, emotes.users[message.author.id]))
        }
    },
};