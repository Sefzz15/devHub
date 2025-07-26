export interface IOrder {
    oid: number;
    uid: number;
    date: string;
}

export interface IOrderResponse {
    $id: string;
    $values: {
        $id: string;
        oid: number;
        uid: number;
        date: string;
    }
}