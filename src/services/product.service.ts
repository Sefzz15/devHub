import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IProduct, IProductResponse } from '../interfaces/IProduct';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private _url = 'https://localhost:5000/api/products';

  constructor(
    private http: HttpClient
  ) { }

  // Get all products
  getProducts(): Observable<IProductResponse[]> {
    return this.http.get<IProductResponse[]>(`${this._url}`);
  }

  // Get a specific product by ID
  getProduct(pid: number): Observable<IProduct> {
    return this.http.get<IProduct>(`${this._url}/${pid}`);
  }

  // Create a new product
  createProduct(product: IProduct): Observable<IProduct> {
    return this.http.post<IProduct>(`${this._url}`, product);
  }

  // Update an existing product
  updateProduct(pid: number, product: IProduct): Observable<IProduct> {
    return this.http.put<IProduct>(`${this._url}/${pid}`, product);
  }

  // Delete a product
  deleteProduct(pid: number): Observable<any> {
    return this.http.delete<any>(`${this._url}/${pid}`);
  }
}
