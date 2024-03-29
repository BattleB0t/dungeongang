const fs = require('fs');
const Discord = require('discord.js');
const Client = require('./client/Client');
globalThis.logChannel = null
require("./functions/logToChannel")
const { token, prefix } = require('./node_modules/client.json');
const config = require('./data/config.json')
const client = new Client();
const disbut = require('discord-buttons')(client);
client.commands = new Discord.Collection();
const commandFolders = fs.readdirSync('./commands');
const apiFunctions = require('./functions/apiFunctions.js')
const miscFunctions = require('./functions/miscFunctions.js')


for (const folder of commandFolders) {
    const commandFiles = fs
        .readdirSync(`./commands/${folder}`)
        .filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const command = require(`./commands/${folder}/${file}`);
        client.commands.set(command.name, command);
    }
}

globalThis.isInRestart = false
client.on('ready', async () => {
    // logChannel = await client.channels.fetch(config.discord.logChannel)
    console.log(`Starting Dungeon Gang Bot v1.0.0`);
    client.user.setActivity(`Nice PB Kid`, {
        type: 'PLAYING'
    }).catch(console.error);
    setInterval(async function () {
        await checkExpiredPolls();
    }, 60 * 1000);
})
globalThis.messageParam = new Discord.Message();
globalThis.argsParam = [""]
globalThis.configParam = config
globalThis.fsParam = fs
client.on('message', async (message) => {
    if (config.discord.lfg_channels.includes(message.channel.id) && !message.member.roles.cache.has(config.discord.staff_role) && !message.mentions.members.first()) {
        let i = 0;
        let words = config.discord.lfg_dont_purge
        for (const word of words) {
            if (!message.content.toLowerCase().includes(word)) {
                i += 1
            }
        }
        if (words.length === i) return await message.delete()
    }
    if (config.discord.blacklistedChannels.includes(message.channel.id) && !message.member.roles.cache.has(config.discord.staff_role)) return;
    const cmdargs = message.content.slice(prefix.length).split(/ +/);
    const commandName = cmdargs.shift().toLowerCase();
    const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
    if (!command) return;
    if (!message.guild) return;
    if (message.author.bot) return;
    if (!message.content.startsWith(prefix)) return;
    if (command == 'help') {
        messageParam = message
        argsParam = cmdargs
        command.execute()
    } else {
        let args = message.content.substring(prefix.length).split(" ");
        messageParam = message
        argsParam = args
        command.execute()
        // command.execute(message, args, config, fs)

    }
});

let autoDeleteChannels = {}
client.on("message", (message) => {
    if (!config.discord.autoDelete.includes(message.channel.id)) return;
    if (autoDeleteChannels[message.channel.id] !== undefined) return;
    autoDeleteChannels[message.channel.id] = message.channel
})

client.on("ready", async () => {
    setInterval(async () => {
        Object.values(autoDeleteChannels).forEach(async channel => {
            let messages = await channel.messages.fetch({ limit: 100 })
            messages = messages.filter(message => !(message.member.roles.cache.has(config.discord.staff_role) || message.pinned))
            channel.bulkDelete(messages)
        })
    }, 60 * 1000)
})

client.on('voiceStateUpdate', (oldState, newState) => {
    if (oldState.member.user.bot) return;
    if (oldState.member.id !== "343129897360949248") return;
    if (newState.channel === null) return;
    let membersChannel = newState.guild.channels.cache.get("742495313981604020")
    if (newState.channel.id === "857541825312325632") newState.member.voice.setChannel(membersChannel, 'Moved ' + newState.member.user.tag + ' into the channel ' + membersChannel.name + ' by nick did it')
    else if (newState.serverDeaf) newState.setDeaf(false, "nick did it")
    else if (newState.serverMute) newState.setMute(false, "nick did it")
})

client.on('clickButton', async (button) => {
    let message = button.message
    let user = button.clicker.user
    if (user.bot) return button.defer()
    if (!message.guild) return button.defer()
    let polledUsers = JSON.parse(fs.readFileSync('./data/polled_users.json'))
    if (!polledUsers.active_polls.includes(message.id)) return button.defer()
    if (message.guild.member(user).roles.cache.find(r => r.id === config.discord.blacklist_role)) return button.defer()
    if (button.id === 'POSITIVE') {
        if (!getPoll(message.id).votes_positive.includes(user.id) && !getPoll(message.id).votes_neutral.includes(user.id) && !getPoll(message.id).votes_negative.includes(user.id)) {
            writePoll(message.id, user.id, "positive")
            return button.defer()
        } else if (getPoll(message.id).votes_neutral.includes(user.id)) {
            unWritePoll(message.id, user.id, "neutral")
            writePoll(message.id, user.id, "positive")
            return button.defer()
        } else if (getPoll(message.id).votes_negative.includes(user.id)) {
            unWritePoll(message.id, user.id, "negative")
            writePoll(message.id, user.id, "positive")
            return button.defer()
        } else if (getPoll(message.id).votes_positive.includes(user.id)) {
            return button.defer()
        }
    } else if (button.id === 'NEUTRAL') {
        if (!getPoll(message.id).votes_positive.includes(user.id) && !getPoll(message.id).votes_neutral.includes(user.id) && !getPoll(message.id).votes_negative.includes(user.id)) {
            writePoll(message.id, user.id, "neutral")
            return button.defer()
        } else if (getPoll(message.id).votes_positive.includes(user.id)) {
            unWritePoll(message.id, user.id, "positive")
            writePoll(message.id, user.id, "neutral")
            return button.defer()
        } else if (getPoll(message.id).votes_negative.includes(user.id)) {
            unWritePoll(message.id, user.id, "negative")
            writePoll(message.id, user.id, "neutral")
            return button.defer()
        } else if (getPoll(message.id).votes_neutral.includes(user.id)) {
            return button.defer()
        }
    } else if (button.id === 'NEGATIVE') {
        if (!getPoll(message.id).votes_positive.includes(user.id) && !getPoll(message.id).votes_neutral.includes(user.id) && !getPoll(message.id).votes_negative.includes(user.id)) {
            writePoll(message.id, user.id, "negative")
            return button.defer()
        } else if (getPoll(message.id).votes_positive.includes(user.id)) {
            unWritePoll(message.id, user.id, "positive")
            writePoll(message.id, user.id, "negative")
            return button.defer()
        } else if (getPoll(message.id).votes_neutral.includes(user.id)) {
            unWritePoll(message.id, user.id, "neutral")
            writePoll(message.id, user.id, "negative")
            return button.defer()
        } else if (getPoll(message.id).votes_negative.includes(user.id)) {
            return button.defer()
        }
    }
})

const PositiveButton = new disbut.MessageButton()
    .setStyle('green')
    .setLabel('👍')
    .setID('POSITIVE')
    .setDisabled();
const NeutralButton = new disbut.MessageButton()
    .setStyle('blurple')
    .setLabel('🤐')
    .setID('NEUTRAL')
    .setDisabled();
const NegativeButton = new disbut.MessageButton()
    .setStyle('red')
    .setLabel('👎')
    .setID('NEGATIVE')
    .setDisabled();
global.endPollEmbed = async function (message_id, channel_id, EditedPollEmbed) {
    client.channels.cache.get(channel_id).messages.fetch({ around: message_id, limit: 1 })
        .then(message => {
            let fetched_message = message.first();
            fetched_message.edit({
                buttons: [
                    PositiveButton, NeutralButton, NegativeButton
                ],
                embed: EditedPollEmbed
            });
        })
        .catch(error => {
            console.log('Unable to edit message: ' + message_id + ' in channel: ' + channel_id)
            console.log(error)
        })
}

client.login(token)
