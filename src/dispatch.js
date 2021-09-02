import { MessageEmbed } from 'discord.js';

import { getCollection } from './db';
import { STREAM_CHANNEL_ID } from './constants';

export const handleStreams = async (presence, client) => {
  const streams = await getCollection('streams');

  // Get the channel we're going to be posting in
  const newsChannel = await client.channels.fetch(STREAM_CHANNEL_ID);

  // Alias a few things from deep in this tree
  const isStreaming = presence.activities.some(a => a.type === 'STREAMING');
  const streamActivity = presence.activities.find(a => a.type === 'STREAMING');
  const username = presence.member.user.username;

  // Get all streams
  const knownStreams = await streams.find({}).toArray();
  const currentUserStream = knownStreams.find(s => s.username === username);

  if (!isStreaming) {
    try {
      // Clean up old messages before exiting
      if (currentUserStream) {
        const message = await newsChannel.messages.fetch(currentUserStream.messageId, false);
        message.delete();

        await streams.findOneAndDelete(currentUserStream);
      }
    } catch (err) {
      console.log('Error deleting messages');
      console.log(err);
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

    await streams.insertOne({ username, messageId: message.id });
  } catch (err) {
    console.log(`Error notifying about ${username}`);
    console.log(err);
  }
};

export const flushChannel = async client => {
  const streams = await getCollection('streams');

  const newsChannel = await client.channels.fetch(STREAM_CHANNEL_ID);
  const knownStreams = await streams.find({}).toArray();

  for (const stream of knownStreams) {
    const message = await newsChannel.messages.fetch(stream.messageId, false);
    message.delete();

    await streams.remove(stream);
  }
};
