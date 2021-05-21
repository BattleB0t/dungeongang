const Discord = require('discord.js')

module.exports = {
    name: 'votedout',
    aliases: ['vo'],
    usage: 'votedout add/remove [user]',
    description: 'Adds/removes a user from the voted out list',
    async execute(message, args, config, fs) {
        if(!message.member.roles.cache.has(config.discord.staff_role)){
            return message.channel.sendError('You do not have permission to use this command!')
        }
        if(args[1] == 'add'){
            let username;
            if(!args[2]){
                return message.channel.sendError('No username provided.')
            }else if(message.mentions.members.first()){
                try{
                    username = message.mentions.members.first().displayName;
                    username = username.split(" ")[1]
                    username = username.replace(/\W/g, '');
                }catch(error){
                    return message.channel.sendError('An error has occurred while getting this user\'s username')
                }
            }else{ 
                username = args[2];
            }
            let uuid = await getUUID(username)
            if(uuid == 'invalid player') return message.channel.sendError('This player does not exist!')
            let jsonString = fs.readFileSync('./data/votedout.json')
            let json = JSON.parse(jsonString)
            if(json.users.includes(uuid)) return message.channel.sendError('This player is already on the voted-out list!')
            json.users.push(uuid);
            fs.writeFileSync('./data/votedout.json', JSON.stringify(json, null, 2))
            return message.channel.send(createSuccessEmbed(await getIGN(uuid) +` has been added to the voted-out list!`))
        }
        if(args[1] == 'remove'){
            let username;
            if(!args[2]){
                return message.channel.sendError('No username provided.')
            }else if(message.mentions.members.first()){
                try{
                    username = message.mentions.members.first().displayName;
                    username = username.split(" ")[1]
                    username = username.replace(/\W/g, '');
                }catch(error){
                    return message.channel.sendError('An error has occurred while getting this user\'s username')
                }
            }else{ 
                username = args[2];
            }
            let uuid = await getUUID(username)
            if(uuid == 'invalid player') return message.channel.sendError('This player does not exist!')
            let jsonString = fs.readFileSync('./data/votedout.json')
            let json = JSON.parse(jsonString)
            if(!json.users.includes(uuid)) return message.channel.sendError('This player is not on the voted-out list!')
            let index = json.users.indexOf(uuid)
            if(index > -1){
                json.users.splice(index, 1)
            }
            fs.writeFileSync('./data/votedout.json', JSON.stringify(json, null, 2))
            return message.channel.send(createSuccessEmbed(await getIGN(uuid) +` has been removed from the voted-out list!`))
        }
    },
};
