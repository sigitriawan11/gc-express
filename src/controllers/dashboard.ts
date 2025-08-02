import { Op, fn, col, literal } from "sequelize";
import { GCRouter } from "../config/router";
import OrderModel from "../model/order-model";
import moment from "moment";

GCRouter.get()
  .middleware("auth")
  .handler(async (req, res, next) => {
    try {
      const { month = moment().format("YYYY-MM") } = req.query;

      const startDate = new Date(`${month}-01`);
      const endDate = new Date(
        new Date(startDate).setMonth(startDate.getMonth() + 1)
      );

      const baseWhere = {
        created_at: {
          [Op.gte]: startDate,
          [Op.lt]: endDate,
        },
        id_status: {
          [Op.in]: [3, 4],
        },
      };

      const totalRevenue = await OrderModel.sum("total_price", {
        where: baseWhere,
      });

      const totalTransactions = await OrderModel.count({
        where: baseWhere,
      });

      const lineChart = await OrderModel.findAll({
        attributes: [
          [fn("DATE_TRUNC", "day", col("created_at")), "date"],
          [fn("SUM", col("total_price")), "total"],
        ],
        where: baseWhere,
        group: [
          literal(`DATE_TRUNC('day', "created_at")`) as unknown as string,
        ],
        order: [[literal(`DATE_TRUNC('day', "created_at")`), "ASC"]],
        raw: true,
      });

      res.json({
        status: true,
        data: {
          totalRevenue: Number(totalRevenue || 0),
          totalTransactions,
          chart: lineChart.map((row: any) => ({
            date: row.date.toISOString().slice(0, 10),
            total: Number(row.total),
          })),
        },
      });
    } catch (err) {
      next(err);
    }
  });
