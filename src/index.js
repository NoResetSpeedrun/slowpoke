import './environment';
import { Client as DiscordClient } from 'discord.js';

import { GUILD_ID } from './constants';
import { handleStreams, flushChannel } from './dispatch';

const client = new DiscordClient();

client.on('ready', async () => {
  console.log('Ret-2-go!');

  const guild = client.guilds.resolve(GUILD_ID);
  const members = await guild.members.fetch();

  members.each(m => handleStreams(m.presence, client));
});

client.on('presenceUpdate', async (oldPresence, newPresence) => {
  await handleStreams(newPresence, client);
});

client.login(process.env.DISCORD_BOT_TOKEN);
