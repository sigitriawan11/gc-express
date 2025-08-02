import { DataTypes } from 'sequelize';
import { GCModel } from '../config/model';
import { laundryDB } from '../app/database';

interface LogOrderAttributes {
  id?: number;
  id_order: number;
  description?: string;
}

class LogOrderModel extends GCModel<LogOrderAttributes> implements LogOrderAttributes {
  public id!: number;
  public id_order!: number;
  public description!: string;
}

LogOrderModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_order: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize: laundryDB,
    modelName: 'LogOrder',
    schema: 'apps',
    freezeTableName: true,
    tableName: 'log_order',
    timestamps: false
  }
);

export { LogOrderAttributes };
export default LogOrderModel;
