import { GCRouter } from "../config/router";
import { ServiceName } from "../service/service-service";

GCRouter.get().middleware('auth').handler(async (req, res, next) => {
    try {
        const data = await  ServiceName.findAll()

        res.status(200).json({
            status: 200,
            message: 'successfully get data',
            data
        })
    } catch (error) {
        next(error)
    }
})