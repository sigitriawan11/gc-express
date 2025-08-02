import { ErrBadRequest } from "../../error/errors";
import * as bcrypt from "bcrypt";
import { JWTPayloadType } from "../../types/gc-types/auth-types";
import jwt from "jsonwebtoken";
import AccountModel from "../../model/account-model";
import ProfileModel from "../../model/profile-model";
import RoleModel from "../../model/role-model";

export const SiginIn = async (
  param: any
): Promise<any> => {
  const { email, password } = param;

  const account = await AccountModel.findOrFail(
    {
      where: {
        email: email.toLowerCase(),
        deleted_at: null,
      },
    },
    "Email or password incorrect"
  );

  const match = await bcrypt.compare(password, account.password!);

  if (!match) {

    throw new ErrBadRequest("Email or password incorrect");
  }

  const profile = await ProfileModel.findOrFail(
    {
      where: {
        email: email.toLowerCase(),
        deleted_at: null,
      },
    },
    "Your profile account not found"
  );

  const role = await RoleModel.findOrFail({
    where: {
      id: profile.id_role!,
      deleted_at: null,
    },
  }, "Your role account not found");

  const jwt_payload: JWTPayloadType = {
    email: profile.email!,
    id_profile: profile.id,
    id_role: role.id,
  };

  const access_token = jwt.sign(
    jwt_payload,
    process.env.SECRET_ACCESS_TOKEN!,
    { expiresIn: "1h" }
  );
  const refresh_token = jwt.sign(
    jwt_payload,
    process.env.SECRET_REFRESH_TOKEN!,
    { expiresIn: "1h" }
  );
  
  return {
    access_token,
    refresh_token
  }
};
