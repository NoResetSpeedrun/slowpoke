import Sequelize from 'sequelize';

const sequelize = new Sequelize('sqlite:/code/data.db', { logging: false });

export default sequelize;
