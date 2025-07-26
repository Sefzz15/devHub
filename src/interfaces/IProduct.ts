export interface IProduct {
    pid: number;
    pname: string;
    price: number;
    stock: number;
}

export interface IProductResponse {
    $id: string,
    $values:
    {
        $id: string,
        pid: number,
        pname: string,
        price: number,
        stock: number,
    }
}