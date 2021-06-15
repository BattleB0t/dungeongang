module.exports = {
    name: 'command-name',
    aliases: [],
    usage: '',
    description: '',
    async execute() {
        let message = messageParam, args = argsParam, config = configParam, fs = fsParam
        if (!message.member.roles.cache.has(config.discord.staff_role)) return message.reply('you cant use this')
        await message.guild.members.fetch()
        let TopPlus = message.guild.roles.cache.find(role => role.id == "809640966482296872");
        let PlusMembers = message.guild.members.cache.filter(member => member.roles.cache.find(role => role === TopPlus)).map(member => member.nickname);
        plusnames = []
        console.log(PlusMembers.length)
        function sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }
        async function getAllTPPlusPB() {
            let pbString = ""
            for (let i = 0; i < PlusMembers.length; i++) {
                try {
                    let split = PlusMembers[i].split(" ")[1];
                    let mention =
                    await sleep(500)
                    if(await getUUID(split) === 'invalid player'){
                        console.log('invalid username: '+ split)
                        message.client.channels.cache.get('851815405755433000').send('`'+ split + ": " + sPlusPB +'`'+ getID(PlusMembers[i]))
                    }
                    uuid = await getUUID(split)
                    stats = await getCataAndPb(uuid)
                    sPlusPB = stats.fastestTime
                    pbString += split + ": " + sPlusPB + "\n"
                    console.log(split + ": " + sPlusPB)
                    message.client.channels.cache.get('851815405755433000').send('`'+ split + ": " + sPlusPB +'`')
                } catch (e) {
                    let split = PlusMembers[i].split(" ")[1];
                    console.log('error checking user: '+ split)
                    message.client.channels.cache.get('851815405755433000').send('error checking user: '+ split)
                    continue;
                }
            }
            return pbString
        }
        let pbString = await getAllTPPlusPB()
        return message.reply('```' + pbString + '```', { split: true })
        function getID(nickname) {
            let id = message.guild.members.cache.find(m => m.displayName === nickname).id
            return '<@'+id+'>'
        }
    },
};
