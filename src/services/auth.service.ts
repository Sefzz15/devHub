import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _url = 'https://localhost:5000/api/users/login'; // Backend URL
  // private _url = 'https://192.168.1.180:5000/api/users/login'; // Backend URL
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private token: string | null = null;

  public generalError: string = '';

  constructor(private _http: HttpClient) { }

  authenticate(username: string, password: string): Observable<boolean> {
    return this._http.post<{ message: string; token?: string }>(this._url, { username, password }).pipe(
      map(response => {
        console.log('Server response:', response); // Log the full server response
        if (response.message === 'Login successful!' && response.token) {
          const token = response.token;
          this.isAuthenticatedSubject.next(true);
          console.log('Generated Token:', token);
          return true;
        } else {
          console.log('Authentication failed a');
          this.isAuthenticatedSubject.next(false);
          return false;
        }
      }),
      catchError(error => {
        console.error('Error during authentication:', error);
        console.error('General Error:', this.generalError);

        // Handle errors based on the response status or message
        if (error.status === 401 && error.error?.message) {
          this.generalError = 'Invalid credentials';
        } else if (error.status >= 500) {
          this.generalError = 'An error occurred. Please try again later.';
        } else {
          this.generalError = 'An unexpected error occurred. Please check your network or try again later.';
        }

        return throwError(error);
      })
    );
  }

  get isAuthenticated(): Observable<boolean> {
    return this.isAuthenticatedSubject.asObservable();
  }

  logout(): void {
    this.isAuthenticatedSubject.next(false);
  }
}
