let methods = {}

methods.fix = async function(message, args){
    if(!message.member.roles.cache.has(config.discord.poll_creation_role)){
        return message.channel.send(createErrorEmbed('You do not have permission to use this command!'))
    }
    if(!args[1]){
        return message.channel.send(createErrorEmbed('Please provide a valid poll message ID'))
    }
    if(!getPoll(args[1])){
        return message.channel.send(createErrorEmbed('Please provide a valid poll message ID'))
    }
    if(Date.parse(getPoll(args[1]).poll_end_date) < now){
        return message.channel.send(createErrorEmbed('This poll has already ended!'))
    }
    let fixpoll = getPoll(args[1])
    return client.channels.cache.get(fixpoll.poll_channel_id).messages.fetch({around: fixpoll.poll_message_id, limit: 1})
    .then(message => {
        let fetched_message = message.first();
        fetched_message.reactions.removeAll().catch(error => console.error('Failed to clear reactions for: '+ fixpoll.poll_message_id, error));
        message.react('👍')
        message.react('🤐')
        message.react('👎')
    })
    .catch(error => {
        console.log(error)
    })
}