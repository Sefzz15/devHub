export interface IOrder {
    oid: number;
    uid: number;
    date: string;
}

export interface IOrderResponse {
    $id: string;
    $values: IOrderValuesResponse[];
}

export interface IOrderValuesResponse {
    $id: string;
    oid: number;
    uid: number;
    date: string;
}