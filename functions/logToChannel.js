const Discord = require('discord.js');

let newConsole = (function (oldCons) {
    let newFuncs = {
        log: function (text) {
            if (logChannel !== null) {
                let error_embed = new Discord.MessageEmbed()
                    .setColor('0x00bfff')
                    .setDescription(text)
                logChannel.send(error_embed)
            }
            oldCons.log(text);
        },
        info: function (text) {
            if (logChannel !== null) {
                let error_embed = new Discord.MessageEmbed()
                    .setColor('0x00bfff')
                    .setDescription(text)
                logChannel.send(error_embed)
            }
            oldCons.info(text);
        },
        warn: function (text) {
            if (logChannel !== null) {
                let error_embed = new Discord.MessageEmbed()
                    .setColor('0x00bfff')
                    .setDescription(text)
                logChannel.send(error_embed)
            }
            oldCons.warn(text);

        },
        error: function (text) {
            if (logChannel !== null) {
                let error_embed = new Discord.MessageEmbed()
                    .setColor('0x00bfff')
                    .setDescription(text)
                logChannel.send(error_embed)
            }
            oldCons.error(text);
        },
        exception: function (text) {
            if (logChannel !== null) {
                let error_embed = new Discord.MessageEmbed()
                    .setColor('0x00bfff')
                    .setDescription(text)
                logChannel.send(error_embed)
            }
            oldCons.error(text)

        }
    };
    Object.keys(oldCons).forEach((func) => {
        if (newFuncs[func] === undefined) {
            newFuncs[func] = console[func]
        }
    })
    return newFuncs
}(console));
console = newConsole;

process.on('uncaughtException', err => {
    console.log(err.stack, true)
    process.exit(1)
})

process.on('unhandledRejection', err => {
    console.log(err.stack)
})