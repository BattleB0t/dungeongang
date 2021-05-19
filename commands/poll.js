var methods = {}
const config = require('../config.json')
const Discord = require('discord.js')
var polls = require('../polled_users.json')
const fs = require('fs')

methods.polls = async function(message, args){
    if(!message.member.roles.cache.has(config.discord.poll_creation_role)){
        return message.channel.send(createErrorEmbed('You do not have permission to use this command!'))
    }
    if(!args[1]){
        return message.channel.send(createErrorEmbed('No username provided.'))
    }
    let username = args[1]
    if(await getUUID(username) == 'invalid player'){
        return message.channel.send(createErrorEmbed('This player does not exist!'))
    }
    let uuid = await getUUID(username)
    if(await getIGN(uuid) == 'invalid uuid'){
        return message.channel.send(createErrorEmbed('An error has occurred while making the poll, please try again later.'))
    }
    let IGN = await getIGN(uuid)
    let data = await findStats(uuid).catch(error => {
      message.channel.send(createErrorEmbed('I was unable to create a poll for this user since I cannot access their fastest time.'))
      throw new Error('Unable to access stats of player: '+ IGN)
    })
    if(data[0] == 'error'){
        data.shift()
        return message.channel.send(createErrorEmbed(data.toString()))
    }
    let pollEndDate = new Date();
    let poll_id = 0
    if(polls.uuids.some(item => item[uuid])){
        function getIndex(uuids){
          for(let i = 0; i < uuids.length; i++){
            if(Object.keys(uuids[i])[0] === uuid){
            return i
          }
        }
      }
        poll_id = Object.keys(polls.uuids[getIndex(polls.uuids)][uuid]).length
    }
    pollEndDate.setHours( pollEndDate.getHours() + 6 );
    const PollEmbed = {
        "color": 5675786,
        "footer": {
          "icon_url": "https://i.imgur.com/Y3WmAbV.png",
          "text": "Dungeon Gang Polls"
        },
        "thumbnail": {
          "url": "https://i.imgur.com/Y3WmAbV.png"
        },
        "author": {
          "name": "➤ "+ IGN,
          "icon_url": "https://mc-heads.net/avatar/"+ uuid,
          "url": "https://sky.shiiyu.moe/stats/"+ IGN
        },
        "fields": [
          {
            "name": "**Catacombs Level**",
            "value": data.catacombs,
            "inline": true
          },
          {
            "name": "**Floor 7 S+ PB**",
            "value": data.fastestTime,
            "inline": true
          },
          {
            "name": "**Secrets**",
            "value": data.secretsFound,
            "inline": true
          },
          {
            "name": ":thumbsup: :zipper_mouth: :thumbsdown:",
            "value": "Please be honest when voting, these polls are held to measure someone's skill. Not their popularity or personalities",
            "inline": false
          },
          {
            "name": "**Anonymous**",
            "value": "True",
            "inline": true
          },
          {
            "name": "**Poll End Time**",
            "value": pollEndDate.toLocaleString(),
            "inline": true
          }
        ]
      };
      message.channel.send(createSuccessEmbed(`Poll for ${IGN} sent in <#${config.discord.poll_channel}>!`))
      return message.client.channels.cache.get(config.discord.poll_channel).send({ embed: PollEmbed }).then(message => {
          message.react('👍')
          message.react('🤐')
          message.react('👎')
          let pollJson = {
              "poll_id": poll_id,
              "username": IGN,
              "poll_message_id": message.id,
              "poll_channel_id": message.channel.id,
              "votes_positive": [],
              "votes_neutral": [],
              "votes_negative": [],
              "uuid": uuid,
              "personal_best": data.fastestTime,
              "catacombs_level": data.catacombs,
              "secrets": data.secretsFound,
              "poll_end_date": pollEndDate,
              "active": true
          }
          if(poll_id == 0){
              let player_info = {
                  [uuid]: []
              }
              console.log('ID: '+ poll_id)
              player_info[uuid].push(pollJson)
              polls.uuids.push(player_info)
          }else{
              console.log('ID: '+ poll_id)
              polls.uuids[getIndex(polls.uuids)][uuid].push(pollJson)
          }
          polls.active_polls.push(message.id)
          let json_data = JSON.stringify(polls, null, 2)
          fs.writeFileSync('./polled_users.json', json_data)
      }).catch(error => {
        console.log(error)
        message.channel.send(createErrorEmbed('Unable to create poll. Please contact nick#0404 for assistance.'))
      })
}

exports.data = methods