import { Model } from 'sequelize';
import { usermanagementDB } from '../app/database';
import { GCModel } from '../config/model';

interface AccountAttributes {
}

class AccountModel extends GCModel<AccountAttributes> {
}

AccountModel.init(
  {},
  {
    sequelize: usermanagementDB,
    modelName: 'account',
    schema: 'appss',
    freezeTableName: true,
    tableName: 'account',
    createdAt: false,
    updatedAt: false,
    deletedAt: false,
  }
);

export { AccountAttributes };
export default AccountModel;
