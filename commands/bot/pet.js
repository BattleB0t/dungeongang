const Discord = require('discord.js')
const axios = require('axios')
const GIFEncoder = require('gifencoder')
const Canvas = require('canvas')
module.exports = {
    name: 'pet',
    aliases: [],
    usage: 'pet [user]',
    description: 'Creates the pet gif using the user\'s avatar',
    hidden: false,
    async execute() {
        let message = messageParam, args = argsParam, config = configParam, fs = fsParam

        let avatarLink = `https://cdn.discordapp.com/avatars/${message.member.id}/${message.member.user.avatar}.png`
        if (message.mentions.members.first())
            avatarLink = `https://cdn.discordapp.com/avatars/${message.mentions.members.first().id}/${message.mentions.members.first().user.avatar}.png`
        else if (args[1]) {
            let uuid = await getUUID(args[1])
            if (uuid !== 'invalid player') {
                avatarLink = `https://crafatar.com/renders/head/${uuid}?size=512&overlay`
            }
        }
        const petGifCache = []

        const options = {
            resolution: 192,
            delay: 20,
            backgroundColor: null,
        }

        const encoder = new GIFEncoder(options.resolution, options.resolution)

        encoder.start()
        encoder.setRepeat(0)
        encoder.setDelay(options.delay)
        encoder.setTransparent()

        const canvas = Canvas.createCanvas(options.resolution, options.resolution)
        const ctx = canvas.getContext('2d')

        const avatar = await Canvas.loadImage(avatarLink)

        for (let i = 0; i < 10; i++) {
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            if (options.backgroundColor) {
                ctx.fillStyle = options.backgroundColor
                ctx.fillRect(0, 0, canvas.width, canvas.height)
            }

            const j = i < 10 / 2 ? i : 10 - i

            const width = 0.8 + j * 0.02
            const height = 0.8 - j * 0.05
            const offsetX = (1 - width) * 0.5 + 0.1
            const offsetY = (1 - height) - 0.08

            if (i == petGifCache.length) petGifCache.push(await Canvas.loadImage(fs.readFileSync(`./data/petImage/pet${i}.gif`)))

            ctx.drawImage(avatar, options.resolution * offsetX, options.resolution * offsetY, options.resolution * width, options.resolution * height)
            ctx.drawImage(petGifCache[i], 0, 0, options.resolution, options.resolution)

            encoder.addFrame(ctx)
        }

        encoder.finish()

        let gif = encoder.out.getData()
        fs.writeFileSync(`./data/petImage/${message.member.id}petpet.gif`, gif)
        await message.channel.send(`<@${message.member.id}>`, new Discord.MessageAttachment(`data/petImage/${message.member.id}petpet.gif`));
        fs.unlinkSync(`./data/petImage/${message.member.id}petpet.gif`)
    }
}