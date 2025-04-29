import { ModelStatic } from "sequelize";
import { ErrBadRequest } from "../error/errors";
import jwt from "jsonwebtoken";
import { GCModel } from "./model";
import AccountModel from "../model/account-model";
import { JWTPayloadType } from "../types/gc-types/auth-types";

export class GCAuth {

  private readonly attributes_auth : Array<string> = [] // default menggunakan column email kalo kosong
  private readonly attribute_compare_auth: string = "" // default menggunakan column password kalo string kosong

  static me() : JWTPayloadType {
    const req = globalThis as any;
    if (!req.jwt_payload) {
      throw new Error('JWT payload is not available.');
    }

    return req.jwt_payload as JWTPayloadType;
  }
  
  static async validate(access_token: string, withRefreshToken: boolean = false) {
    function verifyJwtToken(token: string, secret: string) {
      return new Promise((resolve, reject) => {
        jwt.verify(token, secret, (err, decoded) => {
          if (err) {
            reject(err);
          } else {
            resolve(decoded);
          }
        });
      });
    }

    let isVerify = await verifyJwtToken(
      access_token,
      process.env.SECRET_ACCESS_TOKEN ?? ""
    )
      .then(() => true)
      .catch(() => false);

    if (withRefreshToken) {
      if (!isVerify) {
        isVerify = await verifyJwtToken(
          access_token,
          process.env.SECRET_REFRESH_TOKEN ?? ""
        )
          .then(() => true)
          .catch(() => false);
      }

      if (!isVerify) {
        throw new ErrBadRequest(`JWT Token Invalid`);
      }
    }

    const decoded = jwt.decode(access_token);
    if (!decoded) {
      throw new ErrBadRequest(`Invalid Payload`);
    }

    return decoded;
  }
}
