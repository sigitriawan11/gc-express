export interface PaginateRequest {
    page: string | number,
    pageSize: string | number,
}

export interface PaginateResponse {
    data: Array<any>,
    paginate: {
        page: string | number,
        pageSize: string | number,
        total: number
    }
}