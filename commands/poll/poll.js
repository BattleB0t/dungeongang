const Discord = require('discord.js')

module.exports = {
  name: 'poll',
  aliases: [],
  usage: 'poll [username]',
  description: 'Creates a poll for the specified user',
  async execute(message, args, config, fs) {
    let polls = JSON.parse(fs.readFileSync('./data/polled_users.json'))
    if(!message.member.roles.cache.has(config.discord.poll_creation_role)){
        return message.channel.send(createErrorEmbed('You do not have permission to use this command!'))
    }
    if(!args[1]){
        return message.channel.send(createErrorEmbed('No username provided.'))
    }
    let username = args[1]
    let uuid = await getUUID(username)
    if(uuid == 'invalid player'){
        return message.channel.send(createErrorEmbed('This player does not exist!'))
    }
    let IGN = await getIGN(uuid)
    if(IGN == 'invalid uuid'){
        return message.channel.send(createErrorEmbed('An error has occurred while making the poll, please try again later.'))
    }
    let data = await getCataAndPb(uuid)
    .catch(error => {
        if(!error.isAxiosError) {
            message.channel.send(createErrorEmbed(error))
            throw error
        }
        console.log('axios error')
        let errorMessage = error.response.data.cause
        message.channel.send(createErrorEmbed(errorMessage))
        throw error
    })
    let secrets = await getSecretCountCataDiscord(uuid)
      .catch(error => {
          if(!error.isAxiosError) {
              message.channel.send(createErrorEmbed(error))
              throw error
          }
          console.log('axios error')
          let errorMessage = error.response.data.cause
          message.channel.send(createErrorEmbed(errorMessage))
          throw error
      })
    uuid = uuid.substr(0, 8) + "-" + uuid.substr(8, 4) + "-" + uuid.substr(12, 4) + "-" + uuid.substr(16, 4) + "-" + uuid.substr(20)
    if (data === "Api throttle") { return message.channel.send(createErrorEmbed("API Throttle: Please try again later.")) }
    if (secrets === "Api throttle") { return message.channel.send(createErrorEmbed("API Throttle: Please try again later.")) }
    let catacombs = data.cataLevel
    let master6 = data['M6']['sPlus']
    let floor7 = data['F7']['sPlus']
    let secretsFound = secrets.secretCount
    if(!isNaN(floor7)) floor7 = fmtMStoMSS(floor7)
    if(!isNaN(master6)) master6 = fmtMStoMSS(master6)
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
            "value": catacombs,
            "inline": true
          },
          {
            "name": "**Floor 7 S+ PB**",
            "value": floor7,
            "inline": true
          },
          {
            "name": "**Master 6 S+ PB**",
            "value": master6,
            "inline": true
          },
          {
            "name": "**Secrets**",
            "value": secretsFound,
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
          fs.writeFileSync('./data/polled_users.json', json_data)
      }).catch(error => {
        console.log(error)
        message.channel.send(createErrorEmbed('Unable to create poll. Please contact nick#0404 for assistance.'))
      })
    },
};
