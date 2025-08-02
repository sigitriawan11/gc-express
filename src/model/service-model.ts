import { DataTypes } from 'sequelize';
import { GCModel } from '../config/model';
import { laundryDB } from '../app/database';

interface ServiceAttributes {
  id?: number;
  name: string;
  price_per_kg: number;
  estimated_duration: number;
}

class ServiceModel extends GCModel<ServiceAttributes>{ 
  public id!: number;
  public name!: string;
  public price_per_kg!: number;
  public estimated_duration!: number;
}

ServiceModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    price_per_kg: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    estimated_duration: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    sequelize: laundryDB,
    modelName: 'Service',
    schema: 'apps',
    freezeTableName: true,
    tableName: 'services',
    timestamps: false
  }
);

export { ServiceAttributes };
export default ServiceModel;
