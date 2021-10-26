import sequelize from './connection';

// Connect the models to the database
export * from './models';

sequelize
  .sync()
  .then(async () => {
    console.log('Database synced');
  })
  .catch(console.error);
