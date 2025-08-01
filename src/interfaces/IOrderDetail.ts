export interface IinternalOrderView {
    orderId: number;
    product: string;
    quantity: number;
    price: number;
    totalPrice: number;
}

export interface IOrderDetail {
    $id: string;
    $values: IOrderDetailsValues[];
}

export interface IOrderDetailsValues {
    $id: string;
    oid: number;
    pid: number;
    quantity: number;
    order: IOrder;
    product: IProduct;
}

export interface IOrder {
    $id: string;
    oid: number;
    uid: number;
    date: string;
    user: IUser;
}

export interface IUser {
    $id: string;
    uid: number;
    uname: string;
    upass: string;
}

export interface IProduct {
    $id: string;
    pid: number;
    pname: string;
    price: number;
    stock: number;
}

export interface IOrderDetailsValuesFormatted {
    oid: number;
    date: string;
    productName: string;
    quantity: number;
    price: number;
    order: {
        user: {
            uname: string;
        };
    };
}


export interface IGroupedOrder {
    orderId: number;
    date: string;
    totalAmount: number;
    items: {
        product: string;
        quantity: number;
        price: number;
        totalPrice: number;
    }[];
}
