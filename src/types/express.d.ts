import { GCModel } from "../config/model";
import { JWTPayloadType } from "./gc-types/auth-types";
import { Attributes } from 'sequelize';
declare global {
  namespace Express {
    interface Request {
      model: GCModel<any>;
      jwt_payload: JWTPayloadType,
      jwt_token: string
    }
  }
}

export {};
