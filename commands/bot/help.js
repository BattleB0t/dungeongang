const Discord = require('discord.js');

const yes = `845121770590961696`;
const no = `845121806049869824`;

const package = require('../../package.json')

module.exports = {
    name: 'help',
    aliases: ['h', 'info', `commands`],
    usage: 'help [command]',
    description: 'Gets information about the bot',
    execute(message, args, config, fs) {
        // console.log(args)
        if (args.length === 1) {
            const commandFolders = fs.readdirSync('./commands');

            let embed = new Discord.MessageEmbed()
                .setAuthor(`Help - Dungeon Gang`, message.client.user.avatarURL())
                .setDescription(`For more information run \`help [command]\``)
                .setColor('0x00bfff')

            var commandsNum = 0;

            for (const folder of commandFolders) {
                let descriptions = [];
                const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'));
                for (const file of commandFiles) {
                    const command = require(`../${folder}/${file}`);
                    let currentCommand = [];
                    currentCommand.push(`\`${command.name}\``);
                    currentCommand.push('-');
                    currentCommand.push(command.description);
                    descriptions.push(currentCommand.join(' '));
                    commandsNum++;
                }
                embed.addField((folder.charAt(0).toUpperCase() + folder.slice(1)), descriptions.join('\n'))
            }

            embed.addField('Info', [
                `Prefix: \`${config.prefix}\``,
                `Channel: ${message.channel}`,
                `Discord: [Dungeon Gang](https://discord.gg/dungeon)`
            ].join('\n'), true)

            embed.addField('Stats', [
                `Unique users: \`${message.client.users.cache.size.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}\``,
                `Servers: \`${message.client.guilds.cache.size.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}\``,
                `Version: \`${package.version}\``,
                `Uptime: \`${timeConversion(message.client.uptime)}\``,
                `Commands: \`${commandsNum}\``
            ].join('\n'), true)

            return message.channel.send(embed)
        }

        const name = args[1].toLowerCase();
        const command = message.client.commands.get(name) || message.client.commands.find(c => c.aliases && c.aliases.includes(name));

        if (!command) {
            return message.channel.send(
                new Discord.MessageEmbed()
                    .setDescription(`\`${name}\` isn't a valid command`)
                    .setColor('0x00bfff')
            );
        }

        let embed = new Discord.MessageEmbed()
            .setAuthor(`Help - ${command.name}`, message.client.user.avatarURL())
            .setColor('0x00bfff')

        var desc = [`*${command.description}*`, `Usage: \`${command.usage}\``];

        embed.setDescription(desc.join('\n'))
        embed.addField('Aliases', `\`${command.aliases.join('\n')}\``, true)

        return message.channel.send(embed)
            .then(() => {
                message.react(yes);
            })
            .catch(() => {
                message.channel.send(
                    new Discord.MessageEmbed()
                        .setDescription(`${message.author}, Error!`)
                        .setColor('0x00bfff')
                ).then(() => {
                    message.react(no);
                })
            });
    },
};

function timeConversion(millisec) {
    var seconds = (millisec / 1000).toFixed(0);

    var minutes = (millisec / (1000 * 60)).toFixed(0);

    var hours = (millisec / (1000 * 60 * 60)).toFixed(0);

    var days = (millisec / (1000 * 60 * 60 * 24)).toFixed(0);

    var weeks = (millisec / (1000 * 60 * 60 * 24 * 7)).toFixed(0);

    if (seconds < 60) {
        return seconds + " Seconds";
    } else if (minutes < 60) {
        return minutes + " Minutes";
    } else if (hours < 24) {
        return hours + " Hours";
    } else if (days > 7) {
        return days + " Days"
    } else {
        return weeks + " Weeks"
    }
}