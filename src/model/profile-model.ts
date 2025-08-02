import { DataTypes } from 'sequelize';
import { GCModel } from '../config/model';
import { laundryDB } from '../app/database';

interface ProfileAttributes {
  id?: string;
  email?: string;
  id_role?: string;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date | null;
}

class ProfileModel extends GCModel<ProfileAttributes> {
  public id!: string;
  public email!: string | null;
  public fullname!: string | null;
  public phone!: string | null;
  public profile_img!: string | null;
  public gender!: string | null;
  public id_role!: string | null;
  public created_at!: Date;
  public updated_at!: Date;
  public deleted_at!: Date | null;
}

ProfileModel.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    id_role: {
      type: DataTypes.UUID,
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
    modelName: 'Profile',
    schema: 'apps',
    freezeTableName: true,
    tableName: 'profiles',
    paranoid: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
  }
);

export { ProfileAttributes };
export default ProfileModel;
