import './environment';
import { Client as DiscordClient, Intents } from 'discord.js';

import { GUILD_ID } from './constants';
import { handleStreams, flushInvalidStreams, flushOldMessages } from './dispatch';
import EventHandler from './EventHandler';

const client = new DiscordClient({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
    Intents.FLAGS.GUILD_INTEGRATIONS,
    Intents.FLAGS.GUILD_PRESENCES,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
  ],
});

const jobs = [flushInvalidStreams, flushOldMessages];

client.on('ready', async () => {
  console.log('Ret-2-go!');

  const guild = client.guilds.resolve(GUILD_ID);
  const members = await guild.members.fetch();

  setInterval(async () => {
    for (const job of jobs) {
      try {
        await job(client);
      } catch {}
    }
  }, 2500);

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

client.on('messageCreate', message => {
  const PREFIX = '!';
  //filter the message if it starts with the prefix
  if (!message.content.startsWith(PREFIX)) return;
  const input = message.content.slice(PREFIX.length).trim();
  if (!input.length) return;
  const [, command, commandArgs] = input.match(/(\w+)\s*([\s\S]*)/);

  //this role is Admins on NoReset's server
  if (command == 'newevent' && message.member.roles.cache.has('240526857861070858')) {
    new EventHandler(client, message, 'new');
  } else {
    console.log(`Denied newevent to user ${message.author.tag}`);
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
