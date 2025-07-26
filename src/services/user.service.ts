import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IUser, IUserResponse } from '../interfaces/IUser';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private _url = 'https://localhost:5000/api/users';

  constructor(
    private http: HttpClient
  ) { }

  // Get all users
  getUsers(): Observable<IUserResponse[]> {
    return this.http.get<IUserResponse[]>(`${this._url}`);
  }

  // Get a specific user by ID
  getUser(id: number): Observable<IUser> {
    return this.http.get<IUser>(`${this._url}/${id}`);
  }

  // Get user ID by username
  // observable<any> needs to be updated
  getUserIdByUsername(username: string): Observable<IUser> {
    return this.http.get<IUser>(`${this._url}/getIdByUsername/${username}`);
  }

  // Create a new user
  createUser(user: IUser): Observable<IUser> {
    return this.http.post<IUser>(`${this._url}`, user);
  }

  // Update an existing user
  updateUser(id: number, user: IUser): Observable<IUser> {
    return this.http.put<IUser>(`${this._url}/${id}`, user);
  }

  // Delete a user
  deleteUser(id: number): Observable<any> {
    return this.http.delete<any>(`${this._url}/${id}`);
  }
}
