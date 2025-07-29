export interface IProduct {
    pid: number;
    pname: string;
    price: number;
    stock: number;
}

export interface IProductResponse {
    $id: string,
    $values: IProductValuesResponse[];
}

export interface IProductValuesResponse {
    pid: number;
    pname: string;
    price: number;
    stock: number;
}