import { GCRouter } from "../config/router";
import { OrderService } from "../service/order-service";
import { OrderValidation } from "../validation/order-validation";
import { Validation } from "../validation/validate";

GCRouter.Group()
  .middleware("auth")
  .use((route) => {
    route.get().handler(async (req, res, next) => {
      try {
        const {
          page = "1",
          pageSize = "10",
          search,
        } = req.query as { page: string; pageSize: string; search?: string };
        const data = await OrderService.findOrder({
          page: parseInt(page),
          pageSize: parseInt(pageSize),
          search,
        });

        res.status(200).json({
          status: true,
          message: "Successfully get data",
          data: data,
        });
      } catch (error) {
        next(error);
      }
    });
    route.get('summary').handler(async (req, res, next) => {
      try {
        const {
          page = "1",
          pageSize = "10",
          search,
        } = req.query as { page: string; pageSize: string; search?: string };
        const data = await OrderService.findOrderSummary({
          page: parseInt(page),
          pageSize: parseInt(pageSize),
          search,
        });

        res.status(200).json(data);
      } catch (error) {
        next(error);
      }
    });
    route.post('summary').handler(async (req, res, next) => {
      try {
        const data = await OrderService.downloadSummary();

        res.status(200).send(data);
      } catch (error) {
        next(error);
      }
    });

    route.post().handler(async (req, res, next) => {
      try {
        const validation = Validation.validate(
          OrderValidation.OrderRequestCreate,
          {...req.body, phone_number: req.body?.phone_number ? `${req.body.phone_number}` : null}
        );
        const data = await OrderService.createOrderLaundry(validation);

        res.status(200).json({
          status: true,
          message: "Successfully create data",
          data: data,
        });
      } catch (error) {
        next(error);
      }
    });

    route.put().handler(async (req, res, next) => {
      try {
        const data = await OrderService.updateStatusOrder(req.body?.id ?? '0')

        res.status(200).json({
          status: true,
          message: "Successfully update data",
          data: data,
        });
      } catch (error) {
        next(error);
      }
    });
  });
