import { IOrder } from './IOrder';
import { IProduct } from './IProduct';
import { IUser } from './IUser';

export interface IOrderDetail {
    $id: string;
    $values: IOrderDetailsValues[];
}

export interface IOrderDetailsValues {
    $id: string;
    oid: number;
    pid: number;
    quantity: number;
    order: IOrderWithUser;
    product: IProduct;
}

/** An order as it arrives nested in order details: the canonical shape plus its user. */
export interface IOrderWithUser extends IOrder {
    user: IUser;
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
