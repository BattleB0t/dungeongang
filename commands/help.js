var methods = {}
const config = require('../config.json')
var p = config.discord.poll_prefix

methods.help = function(message){
    let helpEmbed = {
        "color": 12053979,
        "footer": {
          "icon_url": "https://i.imgur.com/Y3WmAbV.png",
          "text": "Dungeon Gang Polls"
        },
        "fields": [
          {
            "name": "Poll Bot Commands\n\ ",
            "value": `\ \n\`${p}help\` Shows this embed\n\`${p}poll <user>\` Creates a poll for the specified user\n\`${p}end <poll message id>\` Ends the poll with the specified message ID`
          }
        ]
      };
      return message.channel.send({ embed: helpEmbed})
}

exports.data = methods