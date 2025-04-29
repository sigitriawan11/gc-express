import { RequestHandler } from "express";
import { GCModel, GCModelStatic } from '../config/model';
import { Attributes } from "sequelize";
import { ErrNotFound } from "../error/errors";

export const modelBindingMiddleware = <TModel extends GCModel<any>>(model: GCModelStatic<TModel>): RequestHandler => {
  return async (req, res, next) => {
    try {
      const whereCondition = req.params as Attributes<TModel>;

      const data = await model.findOne({ where: whereCondition, attributes: {
        exclude: model.exclude
      } });

      if (!data) {
        throw new ErrNotFound();
      }

      req.model = data;

      next();
    } catch (error) {
      next(error);
    }
  };
};
