import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IOrderDetailResponse } from '../interfaces/IOrderDetail';

@Injectable({
    providedIn: 'root'
})
export class OrderDetailService {

    private _url = 'https://localhost:5000/api/orderdetails';

    constructor(
        private http: HttpClient
    ) { }

    // Get all order details
    getOrderDetails(): Observable<IOrderDetailResponse[]> {
        return this.http.get<IOrderDetailResponse[]>(`${this._url}`);
    }

}
