const Discord = require("discord.js");
const axios = require("axios");
const usernames = require("../../util/mojang");

module.exports = {
  name: "verifyban",
  aliases: [],
  usage: "verifyban add/remove [username]",
  description: "Adds/removes a user from the verifyban list",
    hidden: true,
    async execute() {
    let message = messageParam,
      args = argsParam,
      config = configParam,
      fs = fsParam;
    if (!message.member.roles.cache.has(config.discord.staff_role)) {
      return message.channel.send(
        createErrorEmbed("You do not have permission to use this command!")
      );
    }
    if (args[1] == "add") {
      let username;
      if (!args[2]) {
        return message.channel.send(createErrorEmbed("No username provided."));
      } else if (message.mentions.members.first()) {
        try {
          username = message.mentions.members.first().displayName;
          username = username.split(" ")[1];
          username = username.replace(/\W/g, "");
        } catch (error) {
          return message.channel.send(
            createErrorEmbed(
              "An error has occurred while getting this user's username"
            )
          );
        }
      } else {
        username = args[2];
      }
      let uuid = await getUUID(username);
      if (uuid == "invalid player")
        return message.channel.send(
          createErrorEmbed("This player does not exist!")
        );
      let jsonString = fs.readFileSync("./data/banned.json");
      let json = JSON.parse(jsonString);
      if (json.users.includes(uuid))
        return message.channel.send(
          createErrorEmbed("This player is already on the verifyban list!")
        );
      json.users.push(uuid);
      fs.writeFileSync("./data/banned.json", JSON.stringify(json, null, 2));
      return message.channel.send(
        createSuccessEmbed(
          (await getIGN(uuid)) + ` has been added to the verifyban list!`
        )
      );
    }
    if (args[1] == "remove") {
      let username;
      if (!args[2]) {
        return message.channel.send(createErrorEmbed("No username provided."));
      } else if (message.mentions.members.first()) {
        try {
          username = message.mentions.members.first().displayName;
          username = username.split(" ")[1];
          username = username.replace(/\W/g, "");
        } catch (error) {
          return message.channel.send(
            createErrorEmbed(
              "An error has occurred while getting this user's username"
            )
          );
        }
      } else {
        username = args[2];
      }
      let uuid = await getUUID(username);
      if (uuid == "invalid player")
        return message.channel.send(
          createErrorEmbed("This player does not exist!")
        );
      let jsonString = fs.readFileSync("./data/banned.json");
      let json = JSON.parse(jsonString);
      if (!json.users.includes(uuid))
        return message.channel.send(
          createErrorEmbed("This player is not on the verifyban list!")
        );
      let index = json.users.indexOf(uuid);
      if (index > -1) {
        json.users.splice(index, 1);
      }
      fs.writeFileSync("./data/banned.json", JSON.stringify(json, null, 2));
      return message.channel.send(
        createSuccessEmbed(
          (await getIGN(uuid)) + ` has been removed from the verifyban list!`
        )
      );
    }
    if (args[1] == "list") {
      let list = JSON.parse(fs.readFileSync("./data/banned.json"));
      const users = [];
      const msg = await message.channel.send(
        new Discord.MessageEmbed()
          .setColor("0x00bfff")
          .setDescription("Grabbing data from Mojang API...")
      );
      //   list.users.forEach(async (uuid) => {
      //     const response = await axios(
      //       `https://sessionserver.mojang.com/session/minecraft/profile/${uuid}`
      //     );
      //     users.push(response.data.name);
      //     console.log(users);
      //   });

      return msg.edit(
        new Discord.MessageEmbed()
          .setColor("0x00bfff")
          .setDescription(
            "```Verify Banned List:\n" + (await usernames.get(list.users)) + "```"
          )
      );
    }
  },
};
