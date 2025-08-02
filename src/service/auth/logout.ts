import AccountModel from "../../model/account-model";

export const logout = async (param: any) : Promise<void> => {
  const account = await AccountModel.findOrFail({
    where: {
      email: param.jwt_payload.email,
    },
  }, "Your data account not found");

  await account.update({
    access_token: null,
    refresh_token: null
  })
};
