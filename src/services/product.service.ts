import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private _url = 'https://localhost:5000/api/products';

  constructor(
    private http: HttpClient
  ) { }

  // Get all products
  getProducts(): Observable<any> {
    return this.http.get<any>(`${this._url}`);
  }

  // Get a specific product by ID
  getProduct(pid: number): Observable<any> {
    return this.http.get<any>(`${this._url}/${pid}`);
  }

  // Create a new product
  createProduct(product: any): Observable<any> {
    return this.http.post<any>(`${this._url}`, product);
  }

  // Update an existing product
  updateProduct(pid: number, product: any): Observable<any> {
    return this.http.put<any>(`${this._url}/${pid}`, product);
  }

  // Delete a product
  deleteProduct(pid: number): Observable<any> {
    return this.http.delete<any>(`${this._url}/${pid}`);
  }
}
