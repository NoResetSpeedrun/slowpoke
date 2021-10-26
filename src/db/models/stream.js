import sequelize from '../connection';
import { DataTypes, Model } from 'sequelize';

class Stream extends Model {}
Stream.init(
  {
    username: DataTypes.STRING,
    messageId: DataTypes.STRING,
  },
  { sequelize, modelName: 'Stream' },
);

export default Stream;
