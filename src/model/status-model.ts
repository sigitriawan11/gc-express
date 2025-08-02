import { DataTypes } from 'sequelize';
import { GCModel } from '../config/model';
import { laundryDB } from '../app/database';

interface StatusAttributes {
  id?: number;
  name: string;
}

class StatusModel extends GCModel<StatusAttributes> {
  public id!: number;
  public name!: string;
}

StatusModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    }
  },
  {
    sequelize: laundryDB,
    modelName: 'Status',
    schema: 'apps',
    freezeTableName: true,
    tableName: 'statuses',
    timestamps: false
  }
);

export { StatusAttributes };
export default StatusModel;
