const Discord = require('discord.js')
const polls = require('../data/polled_users.json')
const fs = require('fs')
const config = require('../data/config.json')


global.createErrorEmbed = function createErrorEmbed(error) {
  let error_embed = new Discord.MessageEmbed()
    .setColor('0x00bfff')
    .setTitle('<:no:838802013541498890> Error')
    .setDescription(error)
  return error_embed
}
global.createSuccessEmbed = function createSuccessEmbed(success) {
  let success_embed = new Discord.MessageEmbed()
    .setColor('0x00bfff')
    .setTitle('<:yes:838801988241588304> Success')
    .setDescription(success)
  return success_embed
}

global.getPoll = function (message_id) {
  for (let i = 0; i < polls.uuids.length; i++) {
    let uuid = Object.keys(polls.uuids[i])[0]
    for (let j = 0; j < polls.uuids[getIndex(uuid)][uuid].length; j++) {
      if (polls.uuids[i][uuid][j].poll_message_id == message_id) {
        return polls.uuids[i][uuid][j];
      }
    }
  }
}

global.writePoll = function (message_id, user_id, rating) {
  for (let i = 0; i < polls.uuids.length; i++) {
    let uuid = Object.keys(polls.uuids[i])[0]
    for (let j = 0; j < polls.uuids[getIndex(uuid)][uuid].length; j++) {
      if (polls.uuids[i][uuid][j].poll_message_id == message_id) {
        switch (rating) {
          case "positive":
            polls.uuids[i][uuid][j].votes_positive.push(user_id)
            break;
          case "neutral":
            polls.uuids[i][uuid][j].votes_neutral.push(user_id)
            break;
          case "negative":
            polls.uuids[i][uuid][j].votes_negative.push(user_id)
            break;
          case "expire":
            polls.uuids[i][uuid][j].active = false
            let pos1 = polls.active_polls.indexOf(message_id)
            polls.active_polls.splice(pos1, 1)
            break;
          case "endpoll":
            let date = new Date()
            polls.uuids[i][uuid][j].poll_end_date = date
            let pos2 = polls.active_polls.indexOf(message_id)
            polls.active_polls.splice(pos2, 1)
            break;
        }
        return fs.writeFileSync('./data/polled_users.json', JSON.stringify(polls, null, 2))
      }
    }
  }
}

global.unWritePoll = function (message_id, user_id, rating) {
  for (let i = 0; i < polls.uuids.length; i++) {
    let uuid = Object.keys(polls.uuids[i])[0]
    for (let j = 0; j < polls.uuids[getIndex(uuid)][uuid].length; j++) {
      if (polls.uuids[i][uuid][j].poll_message_id == message_id) {
        switch (rating) {
          case "positive":
            let pos1 = polls.uuids[i][uuid][j].votes_positive.indexOf(user_id)
            polls.uuids[i][uuid][j].votes_positive.splice(pos1, 1)
            break;
          case "neutral":
            let pos2 = polls.uuids[i][uuid][j].votes_neutral.indexOf(user_id)
            polls.uuids[i][uuid][j].votes_neutral.splice(pos2, 1)
            break;
          case "negative":
            let pos3 = polls.uuids[i][uuid][j].votes_negative.indexOf(user_id)
            polls.uuids[i][uuid][j].votes_negative.splice(pos3, 1)
            break;
        }
        return fs.writeFileSync('./data/polled_users.json', JSON.stringify(polls, null, 2))
      }
    }
  }
}

global.checkExpiredPolls = async function () {
  checkPoll = async function (message_id) {
    let now = new Date()
    if (!getPoll(message_id)) {
      console.log('Poll with message ID ' + message_id + 'somehow doesn\'t exist, clearing poll.')
      return writePoll(message_id, 'nothing', 'expire')
    }
    if (Date.parse(getPoll(message_id).poll_end_date) < now) {
      console.log('Cleared Poll: ' + message_id)
      writePoll(message_id, 'nothing', 'expire')
      return await endPollEmbed(message_id, getPoll(message_id).poll_channel_id, createPollEndedEmbed(getPoll(message_id)))
    }
  }
  polls.active_polls.forEach(await checkPoll)
}

global.endActivePoll = async function (message_id) {
  let now = new Date()
  if (!getPoll(message_id)) {
    return 'invalid poll'
  }
  if (Date.parse(getPoll(message_id).poll_end_date) < now) {
    return 'poll ended'
  }
  console.log('Ended Poll: ' + message_id)
  writePoll(message_id, 'nothing', 'endpoll')
  writePoll(message_id, 'nothing', 'expire')
  await endPollEmbed(message_id, getPoll(message_id).poll_channel_id, createPollEndedEmbed(getPoll(message_id)))
  return 'success'
}

global.createPollEndedEmbed = function (json) {
  let PollEndedEmbed = {
    "color": 5675786,
    "footer": {
      "icon_url": "https://i.imgur.com/Y3WmAbV.png",
      "text": "Dungeon Gang Polls"
    },
    "thumbnail": {
      "url": "https://i.imgur.com/Y3WmAbV.png"
    },
    "author": {
      "name": "➤ " + json.username,
      "icon_url": "https://mc-heads.net/avatar/" + json.uuid,
      "url": "https://sky.shiiyu.moe/stats/" + json.username
    },
    "fields": [
      {
        "name": "**Catacombs Level**",
        "value": json.catacombs_level,
        "inline": true
      },
      {
        "name": "**Floor 7 S+ PB**",
        "value": json.personal_best,
        "inline": true
      },
      {
        "name": "**Secrets**",
        "value": json.secrets,
        "inline": true
      },
      {
        "name": `Poll Results`,
        "value": `${json.votes_positive.length} :thumbsup: ${json.votes_neutral.length} :zipper_mouth: ${json.votes_negative.length} :thumbsdown:`,
        "inline": false
      },
      {
        "name": "**Anonymous**",
        "value": "True",
        "inline": true
      },
      {
        "name": "**Poll End Time**",
        "value": "Poll Ended",
        "inline": true
      }
    ]
  };
  return PollEndedEmbed
}

global.getPollInProgressEmbed = function (json) {
  let end_date = new Date(Date.parse(json.poll_end_date))
  console.log(end_date.toLocaleString().toString())
  let PollInProgressEmbed = {
    "color": 5675786,
    "footer": {
      "icon_url": "https://i.imgur.com/Y3WmAbV.png",
      "text": "Dungeon Gang Polls"
    },
    "thumbnail": {
      "url": "https://i.imgur.com/Y3WmAbV.png"
    },
    "author": {
      "name": "➤ " + json.username,
      "icon_url": "https://mc-heads.net/avatar/" + json.uuid,
      "url": "https://sky.shiiyu.moe/stats/" + json.username
    },
    "fields": [
      {
        "name": "**Catacombs Level**",
        "value": json.catacombs_level,
        "inline": true
      },
      {
        "name": "**Floor 7 S+ PB**",
        "value": json.personal_best,
        "inline": true
      },
      {
        "name": "**Secrets**",
        "value": json.secrets,
        "inline": true
      },
      {
        "name": `Results`,
        "value": `${json.votes_positive.length} :thumbsup: ${json.votes_neutral.length} :zipper_mouth: ${json.votes_negative.length} :thumbsdown:`,
        "inline": false
      },
      {
        "name": "**Anonymous**",
        "value": "True",
        "inline": true
      },
      {
        "name": "**Poll End Time**",
        "value": end_date.toLocaleString(),
        "inline": true
      }
    ]
  };
  return PollInProgressEmbed
}

function getIndex(uuid) {
  for (let i = 0; i < polls.uuids.length; i++) {
    if (Object.keys(polls.uuids[i])[0] === uuid) {
      return i
    }
  }
}

Discord.GuildMember.prototype.giveCorrectCataRole = async function (cataLevel) {
  let ObjectValues = Object.values(config.discord.cata_roles)
  await this.roles.remove(this.roles.cache.filter(role => ObjectValues.includes(role.id)))
  if (cataLevel > 29) {
    if (cataLevel < 35) {
      this.roles.add(config.discord.cata_roles["30+"])
    } else {
      if (this.roles.cache.find(role => role.id === config.discord.normalTp_role) && cataLevel > 37) {
        this.roles.add(config.discord.cata_roles[cataLevel.toString()])
      } else {
        this.roles.add(config.discord.cata_roles["35+"])
      }
    }
  }
}
