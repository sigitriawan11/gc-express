import { GCRouter } from "../config/router";

GCRouter.get().handler((req, res, next) => {
  res.send({})
})
