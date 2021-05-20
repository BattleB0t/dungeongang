const Discord = require('discord.js')
const axios = require('axios')
const client = new Discord.Client({ partials: ['USER', 'MESSAGE', 'REACTION'] })
const polledUsers = require('./polled_users.json')
const config = require('./config.json')
const polls = require('./commands/poll.js')
const endpoll = require('./commands/endpoll.js')
const help = require('./commands/help.js')
const check = require('./commands/check.js')
const check2 = require('./commands/bot/check.js')
const votedout = require('./commands/bot/votedout.js')
const clown = require('./commands/bot/clown.js')
const apiFunctions = require('./functions/apiFunctions.js')
const miscFunctions = require('./functions/miscFunctions.js')
const updateUser = require('./commands/bot/updateUser.js')
const PPREFIX = config.discord.poll_prefix
const DPREFIX = config.discord.bot_prefix
const fs = require('fs')
client.on('ready', async () => {
    console.log(`Starting Poll Bot v1.0.0`);
    client.user.setActivity(`Nice PB Kid`, {
        type: 'PLAYING'
    }).catch(console.error);
    setInterval(async function(){
        await checkExpiredPolls();
    }, 60 * 1000);
})

client.on('message', async message =>{
    if(message.author.bot) return;
    if(!message.guild) return;
    if(message.content.startsWith(PPREFIX)){
        let args = message.content.substring(PPREFIX.length).split(" ");
        switch(args[0]){
            case "poll":
                await polls.data.polls(message, args)
                break;
            case "end":
                await endpoll.data.endpoll(message, args)
                break;
            case "help":
                help.data.help(message)
                break;
            case "check":
                await check.data.check(message, args)
                break;
        }
    }
    if(message.content.startsWith(DPREFIX)){
        let args = message.content.substring(DPREFIX.length).split(" ");
        switch(args[0]){
            case "c":
            case "check":
                await check2.data.check(message, args, config)
                break;
            case "clown":
                await clown.data.clown(message, args, config, fs)
                break;
            case "votedout":
                await votedout.data.votedout(message, args, config, fs)
                break;
           case "uupdate":
                await updateUser.data.updateUser(message, message.member.user.tag, args, config, fs)
                break;
        }
    }
})


client.on('messageReactionAdd', async (reaction, user) => {
    if(reaction.partial) await reaction.fetch();
    if(reaction.message.partial) await reaction.message.fetch();
    let message = reaction.message
    if(user.bot) return;
    if(!message.guild) return;
    if(!polledUsers.active_polls.includes(message.id)) return;
    if(message.guild.member(user).roles.cache.find(r => r.id === config.discord.blacklist_role)) return reaction.users.remove(user).catch(console.error)
    if(reaction.emoji.name === '👍'){
        if(!getPoll(message.id).votes_positive.includes(user.id) && !getPoll(message.id).votes_neutral.includes(user.id) && !getPoll(message.id).votes_negative.includes(user.id)){
            writePoll(message.id, user.id, "positive")
            return reaction.users.remove(user).catch(console.error)
        }else if(getPoll(message.id).votes_neutral.includes(user.id)){
            unWritePoll(message.id, user.id, "neutral")
            writePoll(message.id, user.id, "positive")
            return reaction.users.remove(user).catch(console.error)
        }else if(getPoll(message.id).votes_negative.includes(user.id)){
            unWritePoll(message.id, user.id, "negative")
            writePoll(message.id, user.id, "positive")
            return reaction.users.remove(user).catch(console.error)
        }else if(getPoll(message.id).votes_positive.includes(user.id)){
            return reaction.users.remove(user).catch(console.error)
        }
    }else if(reaction.emoji.name === '🤐'){
        if(!getPoll(message.id).votes_positive.includes(user.id) && !getPoll(message.id).votes_neutral.includes(user.id) && !getPoll(message.id).votes_negative.includes(user.id)){
            writePoll(message.id, user.id, "neutral")
            return reaction.users.remove(user).catch(console.error)
        }else if(getPoll(message.id).votes_positive.includes(user.id)){
            unWritePoll(message.id, user.id, "positive")
            writePoll(message.id, user.id, "neutral")
            return reaction.users.remove(user).catch(console.error)
        }else if(getPoll(message.id).votes_negative.includes(user.id)){
            unWritePoll(message.id, user.id, "negative")
            writePoll(message.id, user.id, "neutral")
            return reaction.users.remove(user).catch(console.error)
        }else if(getPoll(message.id).votes_neutral.includes(user.id)){
            return reaction.users.remove(user).catch(console.error)
        }
    }else if(reaction.emoji.name === '👎'){
        if(!getPoll(message.id).votes_positive.includes(user.id) && !getPoll(message.id).votes_neutral.includes(user.id) && !getPoll(message.id).votes_negative.includes(user.id)){
            writePoll(message.id, user.id, "negative")
            return reaction.users.remove(user).catch(console.error)
        }else if(getPoll(message.id).votes_positive.includes(user.id)){
            unWritePoll(message.id, user.id, "positive")
            writePoll(message.id, user.id, "negative")
            return reaction.users.remove(user).catch(console.error)
        }else if(getPoll(message.id).votes_neutral.includes(user.id)){
            unWritePoll(message.id, user.id, "neutral")
            writePoll(message.id, user.id, "negative")
            return reaction.users.remove(user).catch(console.error)
        }else if(getPoll(message.id).votes_negative.includes(user.id)){
            return reaction.users.remove(user).catch(console.error)
        }
    }
})

global.endPollEmbed = async function(message_id, channel_id, EditedPollEmbed){
    client.channels.cache.get(channel_id).messages.fetch({around: message_id, limit: 1})
    .then(message => {
    let fetched_message = message.first();
    fetched_message.edit({ embed: EditedPollEmbed });
    fetched_message.reactions.removeAll().catch(error => console.error('Failed to clear reactions for: '+ message.id, error));
    })
    .catch(error => {
        console.log('Unable to edit message: '+ message_id +' in channel: '+ channel_id)
        console.log(error)
    })
}

client.login(config.discord.bot_token)
