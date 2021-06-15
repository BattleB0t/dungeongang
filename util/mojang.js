const axios = require("axios").default;

const get = async (uuids) => {
  const users = [];
  for (const uuid of uuids) {
    const response = await axios(
      `https://sessionserver.mojang.com/session/minecraft/profile/${uuid}`
    );
    users.push(response.data.name);
  }
  console.log(users);
  return users.join("\n");
};

module.exports = { get };
