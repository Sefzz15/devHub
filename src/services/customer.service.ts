import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {

  private _url = 'https://localhost:5000/api/customers';

  constructor(private http: HttpClient) { }

  // Get all customers
  getCustomers(): Observable<any> {
    return this.http.get<any>(`${this._url}`);
  }

  // Get a specific customer by ID
  getCustomer(id: number): Observable<any> {
    return this.http.get<any>(`${this._url}/${id}`);
  }

  // Create a new customer
  createCustomer(customer: any): Observable<any> {
    return this.http.post<any>(`${this._url}`, customer);
  }

  // Update an existing customer
  updateCustomer(id: number, customer: any): Observable<any> {
    return this.http.put<any>(`${this._url}/${id}`, customer);
  }

  // Delete a customer
  deleteCustomer(id: number): Observable<any> {
    return this.http.delete<any>(`${this._url}/${id}`);
  }
}
