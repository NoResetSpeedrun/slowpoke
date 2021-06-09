import { MongoClient } from 'mongodb';

const db = (async () => {
  const client = new MongoClient('mongodb://db:27017/slowpoke', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  await client.connect();

  return client.db('slowpoke');
})();

export const getCollection = async collName => {
  const dbInterface = await db;

  return dbInterface.collection(collName);
};

export const getNextSequence = async collName => {
  const dbInterface = await db;
  const sequences = dbInterface.collection('sequences');

  await sequences.findOneAndUpdate(
    { _id: collName },
    { $set: { _id: collName }, $inc: { current: 1 } },
    { upsert: true },
  );

  const newDoc = await sequences.findOne({ _id: collName });

  return newDoc.current;
};

export const setLastTimestamp = async collName => {
  const dbInterface = await db;
  const timestamps = dbInterface.collection('timestamps');

  await timestamps.findOneAndUpdate(
    { _id: collName },
    { $set: { _id: collName, last: Date.now() } },
    { upsert: true },
  );

  const newDoc = await timestamps.findOne({ _id: collName });

  return newDoc.last;
};

export const getLastTimestamp = async collName => {
  const dbInterface = await db;
  const timestamps = dbInterface.collection('timestamps');

  const newDoc = (await timestamps.findOne({ _id: collName })) || { last: 0 };

  return newDoc.last;
};

export const findCommand = async name => {
  const dbInterface = await db;
  const commands = await dbInterface.collection('commands');

  const queryName = name.startsWith('!') ? name.slice(1).toLowerCase() : name.toLowerCase();

  return commands.findOne({ $or: [{ _id: queryName }, { aliases: queryName }] });
};

export default db;
