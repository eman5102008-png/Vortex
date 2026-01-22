const fs = require("fs");

module.exports = (client) => {
  for (const folder of fs.readdirSync("./bot/commands")) {
    for (const file of fs.readdirSync(`./bot/commands/${folder}`)) {
      const command = require(`../commands/${folder}/${file}`);
      client.commands.set(command.data.name, command);
    }
  }
};
