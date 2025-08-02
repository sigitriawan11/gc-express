import ServiceModel from "../model/service-model"

export class ServiceName {
    static findAll = async () => {
        const data = await ServiceModel.findAll()

        return data.map((item) => {
            return {
                ...item.dataValues
            }
        })
    }
}