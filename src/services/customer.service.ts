import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ICustomer } from '../app/interfaces/ICustomer';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {

  private _url = 'https://localhost:5000/api/customers';

  constructor(
    private http: HttpClient
  ) { }

  // Get all customers
  getCustomers(): Observable<ICustomer[]> {
    return this.http.get<ICustomer[]>(`${this._url}`);
  }

  // Get a specific customer by ID
  getCustomer(id: number): Observable<ICustomer> {
    return this.http.get<ICustomer>(`${this._url}/${id}`);
  }

  // Create a new customer
  createCustomer(customer: ICustomer): Observable<ICustomer> {
    return this.http.post<ICustomer>(`${this._url}`, customer);
  }

  // Update an existing customer
  updateCustomer(id: number, customer: ICustomer): Observable<ICustomer> {
    return this.http.put<ICustomer>(`${this._url}/${id}`, customer);
  }

  // Delete a customer
  deleteCustomer(id: number): Observable<any> {
    return this.http.delete<any>(`${this._url}/${id}`);
  }
}
