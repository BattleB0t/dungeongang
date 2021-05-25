const fs = require('fs');
const Discord = require('discord.js');
const Client = require('./client/Client');
require("./functions/logToChannel")
const { token, prefix } = require('./node_modules/client.json');
const config = require('./data/config.json')
const client = new Client();
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


let MessagesToBeDeletedVerify = []
let MessagesToBeDeletedUpdate = []
globalThis.logChannel = null
client.on('ready', async () => {
    logChannel = await client.channels.fetch(config.discord.logChannel)
    console.log(`Starting Dungeon Gang Bot v1.0.0`);
    client.user.setActivity(`Nice PB Kid`, {
        type: 'PLAYING'
    }).catch(console.error);
    setInterval(async function () {
        await checkExpiredPolls();
    }, 60 * 1000);
    setInterval(() => {
        if (MessagesToBeDeletedVerify.length > 0) {
            let copyArr = MessagesToBeDeletedVerify
            MessagesToBeDeletedVerify = []
            copyArr[0].channel.bulkDelete(copyArr)
            
        }
        if (MessagesToBeDeletedUpdate.length > 0) {
            let copyArr = MessagesToBeDeletedUpdate
            MessagesToBeDeletedUpdate = []
            copyArr[0].channel.bulkDelete(copyArr)
        }
    }, 60 * 1000)
})
globalThis.messageParam = new Discord.Message();
globalThis.argsParam = [""]
globalThis.configParam = config
globalThis.fsParam = fs
client.on('message', async (message) => {
    if (message.channel.id === config.discord.verification_channel || message.channel.id === config.discord.update_channel) {
        if (!message.member.roles.cache.has(config.discord.staff_role)) {
            if (message.channel.id === config.discord.verification_channel)
            MessagesToBeDeletedVerify.push(message)
            else
            MessagesToBeDeletedUpdate.push(message)
        }
    }
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

client.on('messageReactionAdd', async (reaction, user) => {
    if (reaction.partial) await reaction.fetch();
    if (reaction.message.partial) await reaction.message.fetch();
    let message = reaction.message
    if (user.bot) return;
    if (!message.guild) return;
    let polledUsers = JSON.parse(fs.readFileSync('./data/polled_users.json'))
    if (!polledUsers.active_polls.includes(message.id)) return;
    if (message.guild.member(user).roles.cache.find(r => r.id === config.discord.blacklist_role)) return reaction.users.remove(user).catch(console.error)
    if (reaction.emoji.name === '👍') {
        if (!getPoll(message.id).votes_positive.includes(user.id) && !getPoll(message.id).votes_neutral.includes(user.id) && !getPoll(message.id).votes_negative.includes(user.id)) {
            writePoll(message.id, user.id, "positive")
            return reaction.users.remove(user).catch(console.error)
        } else if (getPoll(message.id).votes_neutral.includes(user.id)) {
            unWritePoll(message.id, user.id, "neutral")
            writePoll(message.id, user.id, "positive")
            return reaction.users.remove(user).catch(console.error)
        } else if (getPoll(message.id).votes_negative.includes(user.id)) {
            unWritePoll(message.id, user.id, "negative")
            writePoll(message.id, user.id, "positive")
            return reaction.users.remove(user).catch(console.error)
        } else if (getPoll(message.id).votes_positive.includes(user.id)) {
            return reaction.users.remove(user).catch(console.error)
        }
    } else if (reaction.emoji.name === '🤐') {
        if (!getPoll(message.id).votes_positive.includes(user.id) && !getPoll(message.id).votes_neutral.includes(user.id) && !getPoll(message.id).votes_negative.includes(user.id)) {
            writePoll(message.id, user.id, "neutral")
            return reaction.users.remove(user).catch(console.error)
        } else if (getPoll(message.id).votes_positive.includes(user.id)) {
            unWritePoll(message.id, user.id, "positive")
            writePoll(message.id, user.id, "neutral")
            return reaction.users.remove(user).catch(console.error)
        } else if (getPoll(message.id).votes_negative.includes(user.id)) {
            unWritePoll(message.id, user.id, "negative")
            writePoll(message.id, user.id, "neutral")
            return reaction.users.remove(user).catch(console.error)
        } else if (getPoll(message.id).votes_neutral.includes(user.id)) {
            return reaction.users.remove(user).catch(console.error)
        }
    } else if (reaction.emoji.name === '👎') {
        if (!getPoll(message.id).votes_positive.includes(user.id) && !getPoll(message.id).votes_neutral.includes(user.id) && !getPoll(message.id).votes_negative.includes(user.id)) {
            writePoll(message.id, user.id, "negative")
            return reaction.users.remove(user).catch(console.error)
        } else if (getPoll(message.id).votes_positive.includes(user.id)) {
            unWritePoll(message.id, user.id, "positive")
            writePoll(message.id, user.id, "negative")
            return reaction.users.remove(user).catch(console.error)
        } else if (getPoll(message.id).votes_neutral.includes(user.id)) {
            unWritePoll(message.id, user.id, "neutral")
            writePoll(message.id, user.id, "negative")
            return reaction.users.remove(user).catch(console.error)
        } else if (getPoll(message.id).votes_negative.includes(user.id)) {
            return reaction.users.remove(user).catch(console.error)
        }
    }
})

global.endPollEmbed = async function (message_id, channel_id, EditedPollEmbed) {
    client.channels.cache.get(channel_id).messages.fetch({ around: message_id, limit: 1 })
        .then(message => {
            let fetched_message = message.first();
            fetched_message.edit({ embed: EditedPollEmbed });
            fetched_message.reactions.removeAll().catch(error => console.error('Failed to clear reactions for: ' + message.id, error));
        })
        .catch(error => {
            console.log('Unable to edit message: ' + message_id + ' in channel: ' + channel_id)
            console.log(error)
        })
}

client.login(token)