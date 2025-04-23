import { Model } from 'sequelize';
import { usermanagementDB } from '../app/database';

interface MemberAttributes {
}

class MemberModel extends Model<MemberAttributes> {
}

MemberModel.init(
  {},
  {
    sequelize: usermanagementDB,
    modelName: 'member',
    schema: 'apps',
    freezeTableName: true,
    tableName: 'member',
    createdAt: false,
    updatedAt: false,
    deletedAt: false,
  }
);

export { MemberAttributes };
export default MemberModel;
