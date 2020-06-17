import Datastore from 'nedb-promises';

const db = {};

db.streams = Datastore.create('streams.db');

for (const database of Object.values(db)) {
  database.persistence.setAutocompactionInterval(5000);
}

export default db;
