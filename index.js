require("dotenv").config();

const {
  Client,
  GatewayIntentBits,
  SlashCommandBuilder,
  REST,
  Routes,
  PermissionFlagsBits
} = require("discord.js");

const mongoose = require("mongoose");
const express = require("express");

/* ======================
   DISCORD CLIENT
====================== */
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

/* ======================
   DATABASE
====================== */
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error(err));

const User = mongoose.model("User", new mongoose.Schema({
  userId: String,
  guildId: String,
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 }
}));

/* ======================
   SLASH COMMANDS
====================== */
const commands = [
  new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Ping the bot"),

  new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Ban member")
    .addUserOption(o =>
      o.setName("user")
       .setDescription("User to ban")
       .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Kick member")
    .addUserOption(o =>
      o.setName("user")
       .setDescription("User to kick")
       .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
];

/* ======================
   REGISTER COMMANDS
====================== */
const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
  try {
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands.map(cmd => cmd.toJSON()) }
    );
    console.log("✅ Slash Commands Registered");
  } catch (err) {
    console.error(err);
  }
})();

/* ======================
   BOT EVENTS
====================== */
client.once("ready", () => {
  console.log(`🤖 ${client.user.tag} Online`);
});

client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  if (commandName === "ping") {
    return interaction.reply(`🏓 Pong ${client.ws.ping}ms`);
  }

  if (commandName === "ban") {
    const user = interaction.options.getUser("user");
    await interaction.guild.members.ban(user);
    interaction.reply(`🔨 تم حظر ${user.tag}`);
  }

  if (commandName === "kick") {
    const user = interaction.options.getUser("user");
    await interaction.guild.members.kick(user);
    interaction.reply(`👢 تم طرد ${user.tag}`);
  }
});

/* ======================
   LEVEL SYSTEM
====================== */
client.on("messageCreate", async message => {
  if (message.author.bot || !message.guild) return;

  let user = await User.findOne({
    userId: message.author.id,
    guildId: message.guild.id
  });

  if (!user) {
    user = await User.create({
      userId: message.author.id,
      guildId: message.guild.id
    });
  }

  user.xp += 10;

  if (user.xp >= user.level * 100) {
    user.level++;
    message.channel.send(
      `🎉 ${message.author} وصل لفل ${user.level}`
    );
  }

  await user.save();
});

/* ======================
   API FOR DASHBOARD
====================== */
const app = express();

app.get("/api/status", (req, res) => {
  res.json({
    bot: client.user?.tag || "offline",
    servers: client.guilds.cache.size,
    users: client.users.cache.size
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () =>
  console.log(`🌐 API running on port ${PORT}`)
);

/* ======================
   LOGIN
====================== */
client.login(process.env.TOKEN);
