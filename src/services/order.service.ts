import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IOrder } from '../interfaces/IOrder';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  private _url = 'https://localhost:5000/api/orders';

  constructor(
    private http: HttpClient
  ) { }

  // Get all orders
  getOrders(): Observable<IOrder[]> {
    return this.http.get<IOrder[]>(`${this._url}`);
  }

  // Get a specific order by ID
  getOrder(id: number): Observable<IOrder> {
    return this.http.get<IOrder>(`${this._url}/${id}`);
  }

  // Create a new order
  createOrder(order: IOrder): Observable<IOrder> {
    return this.http.post<IOrder>(`${this._url}`, order);
  }

  // Update an existing order
  updateOrder(id: number, order: IOrder): Observable<IOrder> {
    return this.http.put<IOrder>(`${this._url}/${id}`, order);
  }

  // Delete a order
  deleteOrder(id: number): Observable<any> {
    return this.http.delete<any>(`${this._url}/${id}`);
  }
}
