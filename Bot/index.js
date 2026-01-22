const { Client, GatewayIntentBits, Collection } = require("discord.js");
require("dotenv").config();
const mongoose = require("mongoose");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent
  ]
});

client.commands = new Collection();

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"));

require("./handlers/commandHandler")(client);
require("./handlers/eventHandler")(client);

client.login(process.env.TOKEN);
