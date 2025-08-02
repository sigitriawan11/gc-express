import { QueryTypes } from "sequelize";
import { laundryDB } from "../app/database";
import { GCRouter } from "../config/router";
import { ErrBadRequest } from "../error/errors";

GCRouter.get().handler(async (req, res, next) => {
  try {
    const { phone_number } = req.query as { phone_number: string };

    if (!phone_number) {
      throw new ErrBadRequest("Nomor hp tidak ada");
    }

    const result = await laundryDB.query({
      query: ` SELECT
  o.customer_name,
  o.phone_number,
  o.weight_kg,
  o.price_per_kg,
  o.total_price,
  o.queue_number,
  json_agg(
    json_build_object(
      'status', substring(l.description FROM 'kamu (.+?) sejak'),
      'description', l.description
    ) ORDER BY l.id
  ) AS log
FROM apps.orders o
LEFT JOIN apps.log_order l ON l.id_order = o.id
WHERE o.phone_number ILIKE ?
GROUP BY o.id
ORDER BY o.queue_number;`,
      values: [phone_number],
    }, { type: QueryTypes.SELECT });
    res.json({
      status: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});
