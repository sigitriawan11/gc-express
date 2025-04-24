export interface PaginateType {
    data: Array<any>,
    paginate: {
        page: string | number,
        pageSize: string | number,
        total: number
    }
}