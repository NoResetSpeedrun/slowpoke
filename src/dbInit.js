import Sequelize from 'sequelize';

const sequelize = new Sequelize('sqlite:/code/data.db');

//hint on how to declare new tables
//const Listcount = require('./models/Listcount')(sequelize, Sequelize.DataTypes);

const force = process.argv.includes('--force') || process.argv.includes('-f');

sequelize
  .sync({ force })
  .then(async () => {
    console.log('Database synced');
    sequelize.close();
  })
  .catch(console.error);
