import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IOrderDetailsValues, IOrderDetailsValuesFormatted } from '../interfaces/IOrderDetail';

@Injectable({
    providedIn: 'root'
})
export class OrderDetailService {

    private _url = '/api/orderdetails';
    private _url1 = '/api/orderdetails/formatted';

    constructor(
        private _http: HttpClient
    ) { }

    // Get all order details
    getOrderDetails(): Observable<IOrderDetailsValues[]> {
        return this._http.get<IOrderDetailsValues[]>(`${this._url}`);
    }

       GetAllOrderDetailsFormatted(): Observable<IOrderDetailsValuesFormatted[]> {
        return this._http.get<IOrderDetailsValuesFormatted[]>(`${this._url1}`);
    }

}
