import './environment';
import { Client as DiscordClient } from 'discord.js';

import { GUILD_ID } from './constants';
import { handleStreams, flushChannel } from './dispatch';

const client = new DiscordClient();
const EventHandler = require("./EventHandler");

client.on('ready', async () => {
  console.log('Ret-2-go!');

  const guild = client.guilds.resolve(GUILD_ID);
  const members = await guild.members.fetch();

  members.each(m => handleStreams(m.presence, client));
});

client.on('presenceUpdate', async (oldPresence, newPresence) => {
  await handleStreams(newPresence, client);
});

client.on('guildMemberAdd', async member => {
  if (member.user.username.toLowerCase().includes('h0nde')) {
    console.log('Banning ' + member.user.username);
    await member.ban();
  }
});

client.on("message", msg => {
  if (msg.content.includes("!newevent")) {
    const adminRole = msg.guild.roles.find(
      role => role.name.toLowerCase() === "admin"
    ) || { id: null };
    if (msg.member._roles.find(id => id === adminRole.id)) {
      new EventHandler(client, msg, "new");
    } else {
      console.log(`Denied !newevent to user ${msg.author.tag}`);
    }
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
