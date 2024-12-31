import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private _url = 'https://localhost:5000/api/users';

  constructor(private http: HttpClient) { }

  // Get all users
  getUsers(): Observable<any> {
    return this.http.get<any>(`${this._url}`);
  }

  // // Get a user
  // getUser(id: number): Observable<any> {
  //   return this.http.get<any>(`${this._url}`);
  // }

  // Get a specific user by ID
  getUser(id: number): Observable<any> {
    return this.http.get<any>(`${this._url}/${id}`);
  }


  // Create a new user
  createUser(user: any): Observable<any> {
    return this.http.post<any>(`${this._url}`, user);
  }

  // Update an existing user
  updateUser(id: number, user: any): Observable<any> {
    return this.http.put<any>(`${this._url}/${id}`, user);
  }

  // Delete a user
  deleteUser(id: number): Observable<any> {
    return this.http.delete<any>(`${this._url}/${id}`);
  }
}
