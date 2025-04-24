import { Attributes, FindOptions, Model, ModelStatic, Op } from "sequelize";
import { ErrNotFound } from "../error/errors";
import { PaginateType } from "../types/gc-types/model-types";

export abstract class GCModel<T extends object> extends Model<T> {
  
  static async findOrFail<T extends Model>(
    this: ModelStatic<T>,
    options: FindOptions<Attributes<T>>,
    errorMessage?: string
  ) {
    const data = await this.findOne(options);

    if (!data) {
      throw new ErrNotFound(errorMessage);
    }

    return data;
  }

  static async paginate<T extends Model>(
    this: ModelStatic<T>,
    page: string | number = 1,
    pageSize: string | number = 10
  ) : Promise<PaginateType> {
    const limit = Number(pageSize);
    const offset = (Number(page) - 1) * limit;

    const data = await this.findAndCountAll({ limit, offset });

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
    this: ModelStatic<T>,
    fields: (keyof Attributes<T>)[],
    keyword: string,
    paginate?: {
      page?: string | number,
      pageSize?: string | number
    }
  ) : Promise<PaginateType | Array<Attributes<T>>> {
    let limit, offset;
    if(paginate){
      limit = Number(paginate.pageSize);
      offset = (Number(paginate.page) - 1) * limit;
    }

    const where = {
      [Op.or]: fields.map((field) => ({
        [field]: { [Op.iLike]: `%${keyword}%` },
      })),
    };

    const data = await this.findAndCountAll({ where, limit, offset });

    return paginate ? {
      data: data.rows,
      paginate: {
        total: data.count,
        page: paginate?.page!,
        pageSize: paginate?.pageSize!,
      },
    } : data.rows
  }
}
