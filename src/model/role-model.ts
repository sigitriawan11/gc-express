import { DataTypes } from 'sequelize';
import { GCModel } from '../config/model';
import { laundryDB } from '../app/database';

interface RoleAttributes {
  id?: string;
  name?: string;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date | null;
}

class RoleModel extends GCModel<RoleAttributes> {
  public id!: string;
  public name!: string | null;
  public created_at!: Date;
  public updated_at!: Date;
  public deleted_at!: Date | null;
}

RoleModel.init(
  {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize: laundryDB,
    modelName: 'Role',
    schema: 'apps',
    freezeTableName: true,
    tableName: 'roles',
    paranoid: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
  }
);

export { RoleAttributes };
export default RoleModel;
