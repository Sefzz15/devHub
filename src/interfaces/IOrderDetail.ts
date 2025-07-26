export interface IOrderDetail {
    oid: number;
    pid: number;
    quantity: number;
}

export interface IOrderDetailResponse {
    $id: string;
    $values: IOrderDetailValuesResponse[];
}

export interface IOrderDetailValuesResponse {
    $id: string;
    oid: number;
    pid: number;
    quantity: number;
}