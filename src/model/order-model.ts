import { DataTypes } from 'sequelize';
import { GCModel } from '../config/model';
import { laundryDB } from '../app/database';

interface OrderAttributes {
  id?: number;
  customer_name: string;
  phone_number: string;
  weight_kg: number;
  notes?: string;
  id_service: number;
  price_per_kg: number;
  total_price: number;
  id_status: number;
  queue_number: number;
  created_at?: Date;
  updated_at?: Date;
}

class OrderModel extends GCModel<OrderAttributes> {
  public id!: number;
  public customer_name!: string;
  public phone_number!: string;
  public weight_kg!: number;
  public notes!: string;
  public id_service!: number;
  public price_per_kg!: number;
  public total_price!: number;
  public id_status!: number;
  public queue_number!: number;
  public created_at!: Date | null;
  public updated_at!: Date | null;
}

OrderModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    customer_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    phone_number: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    weight_kg: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    id_service: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    price_per_kg: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    total_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    id_status: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    queue_number: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize: laundryDB,
    modelName: 'Order',
    schema: 'apps',
    freezeTableName: true,
    tableName: 'orders',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export { OrderAttributes };
export default OrderModel;
