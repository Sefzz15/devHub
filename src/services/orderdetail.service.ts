import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrderDetailService {

  private _url = 'https://localhost:5000/api/orderdetails';

  constructor(private http: HttpClient) { }

  // Get all orderdetails
  getOrderDetails(): Observable<any> {
    return this.http.get<any>(`${this._url}`);
  }

  // Get a specific orderdetail by ID
  getOrderDetail(o_details_id: number): Observable<any> {
    return this.http.get<any>(`${this._url}/${o_details_id}`);
  }

  // Create a new orderdetail
  createOrderDetail(orderdetail: any): Observable<any> {
    return this.http.post<any>(`${this._url}`, orderdetail);
  }

  // Update an existing orderdetail
  updateOrderDetail(o_details_id: number, orderdetail: any): Observable<any> {
    return this.http.put<any>(`${this._url}/${o_details_id}`, orderdetail);
  }

  // Delete a orderdetail
  deleteOrderDetail(o_details_id: number): Observable<any> {
    return this.http.delete<any>(`${this._url}/${o_details_id}`);
  }
}
