import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IOrder, IOrderResponse, IOrderValuesResponse } from '../interfaces/IOrder';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  private _url = 'https://localhost:5000/api/orders';

  constructor(
    private _http: HttpClient
  ) { }

  // Get all orders
  getOrders(): Observable<IOrderValuesResponse[]> {
    return this._http.get<IOrderValuesResponse[]>(`${this._url}`);
  }

  // Get a specific order by ID
  getOrder(id: number): Observable<IOrder> {
    return this._http.get<IOrder>(`${this._url}/${id}`);
  }

  // Create a new order
  createOrder(order: IOrder): Observable<IOrder> {
    return this._http.post<IOrder>(`${this._url}`, order);
  }

  // Update an existing order
  updateOrder(id: number, order: IOrder): Observable<IOrder> {
    return this._http.put<IOrder>(`${this._url}/${id}`, order);
  }

  // Delete a order
  deleteOrder(id: number): Observable<any> {
    return this._http.delete<any>(`${this._url}/${id}`);
  }
}
