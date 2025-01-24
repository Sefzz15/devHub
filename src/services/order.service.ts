import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  private _url = 'https://localhost:5000/api/orders';

  constructor(private http: HttpClient) { }

  // Get all orders
  getOrders(): Observable<any> {
    return this.http.get<any>(`${this._url}`);
  }

  // Get a specific order by ID
  getOrder(id: number): Observable<any> {
    return this.http.get<any>(`${this._url}/${id}`);
  }

  // Create a new order
  createOrder(order: any): Observable<any> {
    return this.http.post<any>(`${this._url}`, order);
  }

  // Update an existing order
  updateOrder(id: number, order: any): Observable<any> {
    return this.http.put<any>(`${this._url}/${id}`, order);
  }

  // Delete a order
  deleteOrder(id: number): Observable<any> {
    return this.http.delete<any>(`${this._url}/${id}`);
  }
}
