import { DataTypes } from 'sequelize';
import { GCModel } from '../config/model';
import { laundryDB } from '../app/database';

interface AccountAttributes {
  id?: string;
  email?: string;
  password?: string;
  access_token?: string | null;
  refresh_token?: string | null;
  created_at?: Date | null;
  updated_at?: Date | null;
  deleted_at?: Date | null;
}

class AccountModel extends GCModel<AccountAttributes> {
  public id!: string;
  public email!: string | null;
  public password!: string | null;
  public access_token!: string | null;
  public refresh_token!: string | null;
  public created_at!: Date | null;
  public updated_at!: Date | null;
  public deleted_at!: Date | null;
}

AccountModel.init(
  {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    access_token: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    refresh_token: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize: laundryDB,
    modelName: 'Account',
    schema: 'apps',
    freezeTableName: true,
    tableName: 'accounts',
    paranoid: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
  }
);

export { AccountAttributes };
export default AccountModel;
