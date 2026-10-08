import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IUser, IUserValuesResponse } from '../interfaces/IUser';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private _url = '/api/users';

  constructor(
    private _http: HttpClient
  ) { }

  // Get all users
  getUsers(): Observable<IUserValuesResponse[]> {
    return this._http.get<IUserValuesResponse[]>(`${this._url}`);
  }

  // Get a specific user by ID
  getUser(id: number): Observable<IUser> {
    return this._http.get<IUser>(`${this._url}/${id}`);
  }

  // Create a new user
  createUser(user: IUser): Observable<IUser> {
    return this._http.post<IUser>(`${this._url}`, user);
  }

  // Update an existing user
  updateUser(id: number, user: IUser): Observable<IUser> {
    return this._http.put<IUser>(`${this._url}/${id}`, user);
  }

  // Change a password; the server verifies currentPassword and 401s if wrong
  updatePassword(id: number, currentPassword: string, newPassword: string): Observable<any> {
    return this._http.put<any>(`${this._url}/${id}/password`, { currentPassword, newPassword });
  }

  // Delete a user; the server requires that account's own password
  deleteUser(id: number, password: string): Observable<any> {
    return this._http.delete<any>(`${this._url}/${id}`, { body: { password } });
  }
}
