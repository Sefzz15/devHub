import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _url = 'https://localhost:5000/api/users/login'; // Backend URL
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false); // Tracks authentication status
  private token: string | null = null; // You can add token handling later if needed

  constructor(private _http: HttpClient) { }

  authenticate(username: string, password: string): Observable<boolean> {
    // Send POST request to backend with username and password
    return this._http.post<{ message: string }>(this._url, { username, password }).pipe(
      map(response => {
        if (response.message === 'Login successful!') {
          this.isAuthenticatedSubject.next(true);
          console.log('Authenticated successfully');
          return true;
        } else {
          console.log('Authentication failed');
          this.isAuthenticatedSubject.next(false);
          return false;
        }
      })
    );
  }

  // Observable for tracking the authentication state
  get isAuthenticated(): Observable<boolean> {
    return this.isAuthenticatedSubject.asObservable();
  }

  // Method to log out the user
  logout(): void {
    this.isAuthenticatedSubject.next(false);
    this.token = null; // Clear token if you're using it
  }
}