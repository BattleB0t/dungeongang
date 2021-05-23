const Discord = require('discord.js')
const polls = require('../data/polled_users.json')
const fs = require('fs')
const config = require('../data/config.json')

global.sleep = function (ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

global.createErrorEmbed = function createErrorEmbed(error) {
  let error_embed = new Discord.MessageEmbed()
    .setColor('0x00bfff')
    .setTitle('<:no:838802013541498890> Error')
    .setDescription(error)
  return error_embed
}

Discord.TextChannel.prototype.sendError = async function (error) {
  this.send(createErrorEmbed(error)).then(async message => {
    await sleep(20000)
    message.delete()
  })
}

Discord.Message.prototype.editError = async function (error) {
  this.edit(createErrorEmbed(error))
  await sleep(20000)
  this.delete()
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

global.currentEmoteList = JSON.parse(fs.readFileSync('./data/verified.json'))

Discord.GuildMember.prototype.updateEmote = function (roleID, emote, conditionRole = true) {
  if (conditionRole !== true) {conditionRole = this.roles.cache.has(conditionRole)}
  if (this.roles.cache.has(roleID) && !currentEmoteList.users[this.user.id].emotes.unlocked_emotes.includes(emote) && conditionRole) {
    currentEmoteList.users[this.user.id].emotes.unlocked_emotes.push(emote)
  } else if (!this.roles.cache.has(roleID) && currentEmoteList.users[this.user.id].emotes.unlocked_emotes.includes(emote)) {
    let pos = currentEmoteList.users[this.user.id].emotes.unlocked_emotes.indexOf(emote)
    currentEmoteList.users[this.user.id].emotes.unlocked_emotes.splice(pos, 1)
    if (this.hasEquipped(emote, currentEmoteList) && !currentEmoteList.users[this.user.id].emotes.given_emotes.includes(emote)) {
      let slots = currentEmoteList.users[this.user.id].emotes.slots
      let slots2 = Object.keys(currentEmoteList.users[this.user.id].emotes.slots)
      for (let i = 0; i < slots2.length; i++){
        let slot = Object.keys(currentEmoteList.users[this.user.id].emotes.slots)[i]
        if (slots[slot].includes(emote)){
          slots[slot] = 'none'
        }
      }
    }
  }
}

Discord.GuildMember.prototype.updateSlot = function (roleID, slot) {
  if (this.roles.cache.has(roleID) && !Object.keys(currentEmoteList.users[this.user.id].emotes.slots).includes(slot)) {
    currentEmoteList.users[this.user.id].emotes.slots[slot] = "none"
  } else if (!this.roles.cache.has(roleID) && Object.keys(currentEmoteList.users[this.user.id].emotes.slots).includes(slot)) {
    delete currentEmoteList.users[this.user.id].emotes.slots[slot]
  }
}

Discord.GuildMember.prototype.hasEquipped = function (emote, emotes) {
  let slots = emotes.users[this.user.id].emotes.slots
  let slots2 = Object.keys(emotes.users[this.user.id].emotes.slots)
  for (let i = 0; i < slots2.length; i++){
    let slot = Object.keys(emotes.users[this.user.id].emotes.slots)[i]
    if (slots[slot].includes(emote)){
      return true
    }
  }
  return false
}

Discord.GuildMember.prototype.getEmotes = function () {
  currentEmoteList = JSON.parse(fs.readFileSync('./data/verified.json'))
  let slots = currentEmoteList.users[this.user.id].emotes.slots
  let slots2 = Object.keys(currentEmoteList.users[this.user.id].emotes.slots)
  let emotes = []
  for (let i = 0; i < slots2.length; i++) {
    let slot = Object.keys(currentEmoteList.users[this.user.id].emotes.slots)[i]
    if (slots[slot] != 'none') {
      emotes.push(slots[slot])
    }
  }
  return emotes
}

global.updateAvailableEmotes = async function (message) {
  currentEmoteList = JSON.parse(fs.readFileSync('./data/verified.json'))

  message.member.updateEmote(config.discord.tpPlus_role, "★")
  message.member.updateEmote(config.discord.subFour_role, "⭐", config.discord.tpPlus_role)
  message.member.updateEmote(config.discord.tpPlus_role, "⭐", config.discord.subFour_role)
  message.member.updateEmote(config.discord.booster, "💜")
  message.member.updateEmote(config.discord.msg_100k, "💬")
  message.member.updateEmote(config.discord.msg_250k, "💚")
  message.member.updateEmote(config.discord.vc_500, "🔊")
  message.member.updateEmote(config.discord.vc_1k, "💛")
  message.member.updateEmote(config.discord.g_king, "🎉")
  message.member.updateEmote(config.discord.g_god, "🤑")
  
  fs.writeFileSync('./data/verified.json', JSON.stringify(currentEmoteList, null, 2))
}

global.updateAvailableSlots = async function (message) {
  currentEmoteList = JSON.parse(fs.readFileSync('./data/verified.json'))

  message.member.updateSlot(config.discord.booster, "booster")
  message.member.updateSlot(config.discord.vc_500, "vc500")
  message.member.updateSlot(config.discord.msg_100k, "msg100k")
  message.member.updateSlot(config.discord.g_god, "g_god")
  message.member.updateSlot(config.discord.staff_role, "staff")

  fs.writeFileSync('./data/verified.json', JSON.stringify(currentEmoteList, null, 2))
}

Array.prototype.removeDuplicates = function() {
  let seen = {};
  return this.filter(function(item) {
      return seen.hasOwnProperty(item) ? false : (seen[item] = true);
  });
}


global.createEmoteEmbed = async function(emotes, user) { 
  let slots = 0
  let embed = new Discord.MessageEmbed()
    .setTitle('**__Slots__**')
    .setColor('0x00bfff')
    .setAuthor(await getIGN(user.uuid)+'\'s Emotes', `https://mc-heads.net/avatar/${user.uuid}`)

  Object.keys(user.emotes.slots).forEach(slot => {
    switch(slot) {
      case 'default':
        slots++
        embed.addField(slots +': **Default**', '`'+ user.emotes.slots[slot] +'`', true)
        break;
      case 'vc500':
        slots++
        embed.addField(slots +': **VC Nolife**', '`'+ user.emotes.slots[slot] +'`', true)
        break;
      case 'booster':
        slots++
        embed.addField(slots +': **Booster**', '`'+ user.emotes.slots[slot] +'`', true)
        break;
      case 'msg100k':
        slots++
        embed.addField(slots +': **100k Msg**', '`'+ user.emotes.slots[slot] +'`', true)
        break;
      case 'g_god':
        slots++
        embed.addField(slots +': **Giveaway God**', '`'+ user.emotes.slots[slot] +'`', true)
        break;
      case 'staff':
        slots++
        embed.addField(slots +': **Staff**', '`'+ user.emotes.slots[slot] +'`', true)
        break;
      case 'extra':
        slots++
        embed.addField(slots +': **Extra Slot**', '`'+ user.emotes.slots[slot] +'`', true)
        break;
    }
  })
  if(emotes.length == 0){
    embed.addField('**Available Emotes**', 'You have no emotes :(', false)
  }else{
    embed.addField('**Available Emotes**', '`'+ emotes.join(' ') +'`', false)
  }
  return embed
}

global.createEmoteEmbed2 = async function(user) { 
  let slots = 0
  let embed = new Discord.MessageEmbed()
    .setTitle('**__Slots__**')
    .setColor('0x00bfff')
    .setAuthor(await getIGN(user.uuid)+'\'s Emotes', `https://mc-heads.net/avatar/${user.uuid}`)

  Object.keys(user.emotes.slots).forEach(slot => {
    switch(slot) {
      case 'default':
        slots++
        embed.addField(slots +': **Default**', '`'+ user.emotes.slots[slot] +'`', true)
        break;
      case 'vc500':
        slots++
        embed.addField(slots +': **VC Nolife**', '`'+ user.emotes.slots[slot] +'`', true)
        break;
      case 'booster':
        slots++
        embed.addField(slots +': **Booster**', '`'+ user.emotes.slots[slot] +'`', true)
        break;
      case 'msg100k':
        slots++
        embed.addField(slots +': **100k Msg**', '`'+ user.emotes.slots[slot] +'`', true)
        break;
      case 'g_god':
        slots++
        embed.addField(slots +': **Giveaway God**', '`'+ user.emotes.slots[slot] +'`', true)
        break;
      case 'staff':
        slots++
        embed.addField(slots +': **Staff**', '`'+ user.emotes.slots[slot] +'`', true)
        break;
      case 'extra':
        slots++
        embed.addField(slots +': **Extra Slot**', '`'+ user.emotes.slots[slot] +'`', true)
        break;
    }
  })
  if(user.emotes.unlocked_emotes.length == 0){
    embed.addField('**Unlocked Emotes**', 'This person has no emotes :(', false)
  }else{
    embed.addField('**Unlocked Emotes**', '`'+ user.emotes.unlocked_emotes.join(' ') +'`', false)
  }
  if(user.emotes.given_emotes.length == 0){
    embed.addField('**Given Emotes**', 'This person has no emotes :(', false)
  }else{
    embed.addField('**Given Emotes**', '`'+ user.emotes.given_emotes.join(' ') +'`', false)
  }
  return embed
}

Discord.GuildMember.prototype.isOwner = function() {
  return (this.user.id === "347884694408265729" || this.user.id === "343129897360949248")
}