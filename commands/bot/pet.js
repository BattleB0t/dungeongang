const Discord = require('discord.js')
const path = require('path')
const _ = require('lodash')
const GIFEncoder = require('gifencoder')
const Canvas = require('canvas')
module.exports = {
    name: 'pet',
    aliases: [],
    usage: 'pet [user]',
    description: 'Creates the pet gif using the user\'s avatar',
    async execute() {
        let message = messageParam, args = argsParam, config = configParam, fs = fsParam

        const petGifCache = []

        const options = {
            resolution: 128,
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

        const avatar = await Canvas.loadImage(`https://cdn.discordapp.com/avatars/${message.member.id}/${message.member.user.avatar}.png`)

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

            if (i == petGifCache.length) petGifCache.push(await Canvas.loadImage(path.resolve(__dirname, `img/pet${i}.gif`)))

            ctx.drawImage(avatar, options.resolution * offsetX, options.resolution * offsetY, options.resolution * width, options.resolution * height)
            ctx.drawImage(petGifCache[i], 0, 0, options.resolution, options.resolution)

            encoder.addFrame(ctx)
        }

        encoder.finish()

        let gif = encoder.out.getData()
        fs.writeFileSync("petpet.gif", gif)
        message.channel.send("test", new Discord.MessageAttachment("petpet.gif"));
        fs.unlinkSync("petpet.gif")
    }
}