module.exports = {
    name: 'equip',
    aliases: [],
    usage: 'equip [emote] [slot]',
    description: 'Equips an emoji in the specified slot',
    hidden: false,
    async execute() {
        let message = messageParam, args = argsParam, config = configParam, fs = fsParam
        if(!args[1] || !args[2]){
            return message.channel.send(createErrorEmbed('Incorrect Usage!\nUsage: `equip [emote] [slot]`'))
        }
        let verified = JSON.parse(fs.readFileSync('./data/verified.json'))
        if(!verified.user_ids.includes(message.author.id)){
            return message.channel.send(createErrorEmbed(`This user has not yet verified with Dungeon Gang v2! \n Verify by doing -update in <#${config.discord.update_channel}>`))
        }
        await updateAvailableEmotes(message)
        await updateAvailableSlots(message)
        let emotes = JSON.parse(fs.readFileSync('./data/verified.json'))
        let unlocked = emotes.users[message.author.id].emotes.unlocked_emotes
        let given = emotes.users[message.author.id].emotes.given_emotes
        let slots = emotes.users[message.author.id].emotes.slots
        if(message.member.hasEquipped(args[1], emotes)){
            return message.channel.send(createErrorEmbed('You already have this emote equipped!'))
        }
        if(isNaN(parseInt(args[2]))){
            return message.channel.send(createErrorEmbed('Please enter a valid slot number.'))
        }
        if(Object.keys(slots).length < args[2]){
            return message.channel.send(createErrorEmbed('You have not unlocked this slot!'))
        }
        let slot = Object.keys(slots)[args[2] - 1]
        if(slot == 'staff'){
            function hasUnicode(s) {
                return /[^\u0000-\u007f]/.test(s);
            }
            if(!hasUnicode(args[1])){
                return message.channel.send(createErrorEmbed('Please enter a valid emote!'))
            }
            slots[slot] = args[1]
            fs.writeFileSync('./data/verified.json', JSON.stringify(emotes, null, 2))
            let DiscordEmoji = message.member.getEmotes()
            DiscordEmoji = DiscordEmoji.join('')
            let changeIntoName = message.member.nickname
            let nameSplit = changeIntoName.split(" ")
            changeIntoName = `${nameSplit[0]} ${nameSplit[1]} ${DiscordEmoji}`
            await message.member.setNickname(changeIntoName)
            return message.channel.send(createSuccessEmbed(`Successfully equipped \`${args[1]}\` in slot **#${args[2]}**`))
        }
        if(!unlocked.includes(args[1]) && !given.includes(args[1])){
            return message.channel.send(createErrorEmbed('You have not unlocked this emote!'))
        }
        slots[slot] = args[1]
        fs.writeFileSync('./data/verified.json', JSON.stringify(emotes, null, 2))
        let DiscordEmoji = message.member.getEmotes()
        DiscordEmoji = DiscordEmoji.join('')
        let changeIntoName = message.member.nickname
        let nameSplit = changeIntoName.split(" ")
        changeIntoName = `${nameSplit[0]} ${nameSplit[1]} ${DiscordEmoji}`
        await message.member.setNickname(changeIntoName)
        return message.channel.send(createSuccessEmbed(`Successfully equipped \`${args[1]}\` in slot **#${args[2]}**`))
    },
};