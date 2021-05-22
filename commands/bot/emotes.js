module.exports = {
    name: 'emotes',
    aliases: [],
    usage: 'emotes [user]',
    description: 'See the emojis that a user has',
    async execute(message, args, config, fs) {
        let verified = JSON.parse(fs.readFileSync('./data/verified.json'))
        if(!verified.user_ids.includes(message.author.id)) return message.channel.send(createErrorEmbed('You have not yet verified with Dungeon Gang v2!'))
        if(args.length == 1){
            await updateAvailableEmotes(message)
            await updateAvailableSlots(message)
            let emotes = JSON.parse(fs.readFileSync('./data/verified.json'))
            let unlocked = emotes.users[message.author.id].emotes.unlocked_emotes
            let given = emotes.users[message.author.id].emotes.given_emotes
            let availableEmotes = unlocked.concat(given);
            availableEmotes.removeDuplicates()
            return message.channel.send(await createEmoteEmbed(availableEmotes, emotes.users[message.author.id]))
        }
    },
};