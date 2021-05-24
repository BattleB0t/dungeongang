module.exports = {
    name: 'unequip',
    aliases: [],
    usage: 'unequip [all/slot]',
    description: 'Unequips your emotes',
    async execute() {
        let message = messageParam, args = argsParam, config = configParam, fs = fsParam
        if(!args[1]){
            return message.channel.send(createErrorEmbed('Incorrect Usage!\nUsage: `unequip [all/slot]`'))
        }
        let verified = JSON.parse(fs.readFileSync('./data/verified.json'))
        if(!verified.user_ids.includes(message.author.id)){
            return message.channel.send(createErrorEmbed(`This user has not yet verified with Dungeon Gang v2! \n Verify by doing -update in <#${config.discord.update_channel}>`))
        }
        await updateAvailableEmotes(message)
        await updateAvailableSlots(message)
        let emotes = JSON.parse(fs.readFileSync('./data/verified.json'))
        let slots = emotes.users[message.author.id].emotes.slots
        if(args[1] == 'all'){
            let slots1 = emotes.users[message.author.id].emotes.slots
            let slots2 = Object.keys(emotes.users[message.author.id].emotes.slots)
            for (let i = 0; i < slots2.length; i++){
                let slot1 = Object.keys(emotes.users[message.author.id].emotes.slots)[i]
                if (slots1[slot1] != 'none'){
                    slots1[slot1] = 'none'
                }
            }
            fs.writeFileSync('./data/verified.json', JSON.stringify(emotes, null, 2))
            let changeIntoName = message.member.nickname
            let nameSplit = changeIntoName.split(" ")
            changeIntoName = `${nameSplit[0]} ${nameSplit[1]}`
            await message.member.setNickname(changeIntoName)
            return message.channel.send(createSuccessEmbed('Successfully unequipped all of your emotes!'))
        }
        if(isNaN(parseInt(args[1]))){
            return message.channel.send(createErrorEmbed('Please enter a valid slot number.'))
        }
        if(Object.keys(slots).length < args[1]){
            return message.channel.send(createErrorEmbed('You have not unlocked this slot!'))
        }
        let slot = Object.keys(slots)[args[1] - 1]
        if(slots[slot] == 'none'){
            return message.channel.send(createErrorEmbed('This slot is empty!'))
        }
        slots[slot] = 'none'
        fs.writeFileSync('./data/verified.json', JSON.stringify(emotes, null, 2))
        let DiscordEmoji = message.member.getEmotes()
        DiscordEmoji = DiscordEmoji.join('')
        let changeIntoName = message.member.nickname
        let nameSplit = changeIntoName.split(" ")
        changeIntoName = `${nameSplit[0]} ${nameSplit[1]} ${DiscordEmoji}`
        await message.member.setNickname(changeIntoName)
        return message.channel.send(createSuccessEmbed('Successfully unequipped slot **#'+ args[1] +'**'))
    },
};