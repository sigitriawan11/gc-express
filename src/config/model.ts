import { Attributes, FindOptions, Model, ModelStatic, Op } from "sequelize";
import { ErrBadRequest, ErrNotFound } from "../error/errors";
import { PaginateResponse } from "../types/gc-types/model-types";

export interface GCModelStatic<T extends Model<T>> extends ModelStatic<T> {
  exclude: string[];
}

export abstract class GCModel<T extends object> extends Model<T> {
  static exclude: string[] = [];

  static async findOrFail<T extends Model>(
    this: GCModelStatic<T>,
    options: FindOptions<Attributes<T>>,
    errorMessage?: string
  ) {
    const data = await this.findOne({
      ...options,
      attributes: {
        exclude: this.exclude,
      },
    });

    if (!data) {
      throw new ErrNotFound(errorMessage);
    }

    return data;
  }

  static async paginate<T extends Model>(
    this: GCModelStatic<T>,
    page: string | number = 1,
    pageSize: string | number = 10
  ): Promise<PaginateResponse> {
    const limit = Number(pageSize);
    const offset = (Number(page) - 1) * limit;

    const data = await this.findAndCountAll({ limit, offset, attributes: {
      exclude: this.exclude
    } });

    return {
      data: data.rows,
      paginate: {
        total: data.count,
        page: page,
        pageSize: pageSize,
      },
    };
  }

  static async search<T extends Model>(
    this: GCModelStatic<T>,
    fields: (keyof Attributes<T>)[],
    keyword: string,
    paginate?: {
      page?: string | number;
      pageSize?: string | number;
    }
  ): Promise<PaginateResponse | Array<Attributes<T>>> {
    let limit, offset;
    if (paginate?.page && paginate?.pageSize) {
      limit = Number(paginate.pageSize ?? 10);
      offset = (Number(paginate.page ?? 1) - 1) * limit;
    }

    let where = {};

    if (fields && fields.length && keyword) {
      if (!Array.isArray(fields)) {
        fields = [fields];
      }
      where = {
        [Op.or]: fields.map((field) => ({
          [field]: { [Op.iLike]: `%${keyword}%` },
        })),
      };
    }

    const data = await this.findAndCountAll({ where, limit, offset, attributes: {
      exclude: this.exclude
    } });

    return paginate?.page && paginate?.pageSize
      ? {
          data: data.rows,
          paginate: {
            total: data.count,
            page: Number(paginate?.page! ?? 1),
            pageSize: Number(paginate?.pageSize! ?? 10),
          },
        }
      : data.rows;
  }
}
