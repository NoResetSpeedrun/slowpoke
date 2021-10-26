import { MessageEmbed } from 'discord.js';

import { Stream } from './db';
import { STREAM_CHANNEL_ID } from './constants';

export const handleStreams = async (presence, client) => {
  if (presence === null) {
    return;
  }

  // Get the channel we're going to be posting in
  const newsChannel = await client.channels.fetch(STREAM_CHANNEL_ID);

  // Alias a few things from deep in this tree
  const isStreaming = presence.activities.some(a => a.type === 'STREAMING');
  const streamActivity = presence.activities.find(a => a.type === 'STREAMING');
  const username = presence.member.user.username;

  // Get all streams
  const knownStreams = await Stream.findAll();
  const currentUserStream = knownStreams.find(s => s.username === username);

  if (!isStreaming) {
    try {
      // Clean up old messages before exiting
      if (currentUserStream) {
        const message = await newsChannel.messages.fetch(currentUserStream.messageId, false);
        message.delete();
      }
    } catch (err) {
      console.log('Error deleting messages');
      console.log(err);
    } finally {
      if (currentUserStream) {
        await currentUserStream.destroy();
      }
    }

    // Nothing more we need to do
    return;
  }

  // Don't post duplicate messages
  if (currentUserStream) {
    return;
  }

  try {
    const message = await newsChannel.send({
      embeds: [
        new MessageEmbed()
          .setColor('#be1337')
          .setTitle(username)
          .setURL(streamActivity.url)
          .setThumbnail(streamActivity.assets.largeImageURL())
          .setDescription(streamActivity.details)
          .addFields({ name: 'GAME:', value: streamActivity.state })
          .setTimestamp(),
      ],
    });

    await Stream.create({ username, messageId: message.id });
  } catch (err) {
    console.log(`Error notifying about ${username}`);
    console.log(err);
  }
};

export const flushInvalidStreams = async client => {
  const newsChannel = await client.channels.fetch(STREAM_CHANNEL_ID);
  const knownStreams = await Stream.findAll();

  for (const stream of knownStreams) {
    try {
      const message = await newsChannel.messages.fetch(stream.messageId, false);
    } catch {
      await stream.destroy();
    }
  }
};

export const flushOldMessages = async client => {
  const newsChannel = await client.channels.fetch(STREAM_CHANNEL_ID);
  const knownStreams = await Stream.findAll();
  const knownIds = new Set(knownStreams.map(m => m.messageId));

  const oldMessages = (await newsChannel.messages.fetch()).filter(
    m => m.author.id === client.user.id && !knownIds.has(m.id),
  );

  for (const message of oldMessages.values()) {
    try {
      await message.delete();
    } catch {
      // Ignore all errors
    }
  }
};
