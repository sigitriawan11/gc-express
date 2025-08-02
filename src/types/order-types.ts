export interface RequestCreateOrder {
    customer_name: string
    phone_number: string
    id_service: number,
    weight_kg: number
    notes?: string
}

export interface RequestFindOrder {
    page: number,
    pageSize: number
    search?: string
}