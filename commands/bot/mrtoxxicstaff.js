
module.exports = {
    name: 'mrtoxxicstaff',
    aliases: [],
    usage: '',
    description: '',
    hidden: true,
    async execute() {
        let message = messageParam, args = argsParam, config = configParam, fs = fsParam
        if (!message.member.hasPermission('ADMINISTRATOR')) return message.channel.send(createErrorEmbed('You do not have permission to use this command!'));
        const dataFile = fs.readdirSync("./data")

        if (!dataFile.includes("mrtoxxicstaff.json")) {
            let staffMembers = message.guild.roles.cache.get("824228004137402388").members
            let nameBackup = {}
            message.channel.send(createSuccessEmbed("Changed staff nicknames"))
            staffMembers.forEach(async member => {
                try {
                    nameBackup[member.id] = member.nickname
                    await member.setNickname(`${member.nickname.charAt(0)}52${member.nickname.charAt(0)} MrToxxic 🥈`)
                    await sleep(250)
                } catch (e) { }
            })
            fs.writeFileSync("./data/mrtoxxicstaff.json", JSON.stringify(nameBackup, null, 2))
        } else {
            let nameBackup = JSON.parse(fs.readFileSync("./data/mrtoxxicstaff.json"))

            message.channel.send(createSuccessEmbed("Changed staff nicknames"))
            Object.keys(nameBackup).forEach(async member => {
                try {
                    await message.guild.members.cache.get(member).setNickname(nameBackup[member])
                    await sleep(250)
                } catch (e) { }
            })
            fs.unlinkSync("./data/mrtoxxicstaff.json")
        }
    }
}