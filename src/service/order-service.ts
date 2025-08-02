import { Op, QueryTypes } from "sequelize";
import OrderModel from "../model/order-model";
import { RequestCreateOrder, RequestFindOrder } from "../types/order-types";
import moment from "moment";
import ServiceModel from "../model/service-model";
import LogOrderModel from "../model/log-model";
import StatusModel from "../model/status-model";
import { ErrBadRequest } from "../error/errors";
import { laundryDB } from "../app/database";
import * as XLSX from "xlsx";

const hasActiveOrderToday = async (): Promise<boolean> => {
  const startOfToday = moment().startOf("day").toDate();
  const endOfToday = moment().endOf("day").toDate();

  console.log(startOfToday, endOfToday);

  const activeOrder = await OrderModel.findOne({
    where: {
      created_at: {
        [Op.between]: [startOfToday, endOfToday],
      },
      id_status: {
        [Op.in]: [1, 2],
      },
    },
  });

  return !!activeOrder;
};

const getNextQueueNumber = async (): Promise<number> => {
  const startOfToday = moment().startOf("day").toDate();
  const endOfToday = moment().endOf("day").toDate();

  const lastOrder = await OrderModel.findOne({
    where: {
      created_at: {
        [Op.between]: [startOfToday, endOfToday],
      },
    },
    order: [["queue_number", "DESC"]],
  });

  return lastOrder ? lastOrder.queue_number + 1 : 1;
};

export class OrderService {
  static findOrder = async (param: RequestFindOrder) => {
    const data: any = await laundryDB.query(
      {
        query: "select apps.get_orders_with_pagination(?,?,?) as data",
        values: [param?.page, param.pageSize, param?.search ?? null],
      },
      { type: QueryTypes.SELECT, plain: true }
    );

    return data?.data;
  };
  static findOrderSummary = async (param: RequestFindOrder) => {
    const data: any = await laundryDB.query(
      {
        query:
          "select apps.get_order_summary_with_pagination_and_search(?,?,?) as data",
        values: [param?.page, param.pageSize, param?.search ?? null],
      },
      { type: QueryTypes.SELECT, plain: true }
    );

    return data?.data;
  };

  static downloadSummary = async () => {
    const data: any = await laundryDB.query(
      {
        query: "select apps.get_order_download_data_only() as data",
        values: [],
      },
      { type: QueryTypes.SELECT, plain: true }
    );

    const worksheet = XLSX.utils.json_to_sheet(data?.data);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");

    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    return buffer;
  };

  static createOrderLaundry = async (param: RequestCreateOrder) => {
    const service = await ServiceModel.findOrFail(
      {
        where: {
          id: param.id_service,
        },
      },
      "Layanan tidak ditemukan"
    );

    const hasActive = await hasActiveOrderToday();

    const queue_number = await getNextQueueNumber();

    const id_status = hasActive ? 1 : 2;

    const newOrder = await OrderModel.create({
      ...param,
      id_service: service.id,
      price_per_kg: service.price_per_kg,
      total_price: param.weight_kg * service.price_per_kg,
      id_status: id_status,
      queue_number,
    });

    const status = await StatusModel.findOne({
      where: {
        id: id_status,
      },
    });

    await LogOrderModel.create({
      id_order: newOrder.id,
      description: `Status laundry kamu ${status?.name} sejak ${moment(
        newOrder.created_at
      ).format("YYYY-MM-DD HH:mm:ss")}`,
    });

    return newOrder;
  };

  static updateStatusOrder = async (param: string) => {
    const startOfToday = moment().startOf("day").toDate();
    const endOfToday = moment().endOf("day").toDate();

    const order = await OrderModel.findOrFail(
      {
        where: {
          queue_number: param,
          created_at: {
            [Op.between]: [startOfToday, endOfToday],
          },
        },
      },
      "Data tidak ditemukan"
    );

    if (order.id_status === 4) {
      throw new ErrBadRequest("Status sudah selesai, tidak bisa diubah.");
    }

    const pendingOrdersBefore = await OrderModel.findAll({
      where: {
        queue_number: { [Op.lt]: order.queue_number },
        created_at: { [Op.between]: [startOfToday, endOfToday] },
        id_status: { [Op.in]: [1, 2] },
      },
    });

    if (pendingOrdersBefore.length > 0) {
      throw new ErrBadRequest(
        "Tidak bisa diproses. Masih ada antrian sebelumnya yang belum selesai."
      );
    }

    await order.update({
      id_status: order.id_status + 1,
    });

    const status = await StatusModel.findOne({
      where: { id: order.id_status },
    });

    const description = `Status laundry kamu ${status?.name} sejak ${moment(
      order.updated_at
    ).format("YYYY-MM-DD HH:mm:ss")}`;

    await LogOrderModel.create({
      id_order: order.id,
      description,
    });

    if (order.id_status == 3) {
      const nextOrder = await OrderModel.findOne({
        where: {
          id_status: 1,
          created_at: {
            [Op.between]: [startOfToday, endOfToday],
          },
        },
        order: [["queue_number", "ASC"]],
      });

      if (nextOrder) {
        await nextOrder.update({ id_status: 2 });

        const nextStatus = await StatusModel.findOne({
          where: { id: 2 },
        });

        await LogOrderModel.create({
          id_order: nextOrder.id,
          description: `Status laundry kamu ${
            nextStatus?.name
          } sejak ${moment().format("YYYY-MM-DD HH:mm:ss")}`,
        });
      }
    }

    return order;
  };
}
