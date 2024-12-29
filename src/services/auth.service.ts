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
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private token: string | null = null;

  public generalError: string = '';

  constructor(private _http: HttpClient) { }

  authenticate(username: string, password: string): Observable<boolean> {
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
      }),
      catchError(error => {
        console.error('Error during authentication:', error);

        // Handle errors based on the response status or message
        if (error.status === 401 && error.error?.message) {
          // If status 401 (Unauthorized), and the response contains the message (Invalid credentials)
          this.generalError = 'Invalid credentials';
        } else if (error.status >= 500) {
          // Server-side error handling
          this.generalError = 'An error occurred. Please try again later.';
        } else {
          // Handle any other errors (e.g., network issues)
          this.generalError = 'An unexpected error occurred. Please check your network or try again later.';
        }

        // Return the error to be handled by the component
        return throwError(error);
      })
    );
  }

  get isAuthenticated(): Observable<boolean> {
    return this.isAuthenticatedSubject.asObservable();
  }

  logout(): void {
    this.isAuthenticatedSubject.next(false);
    this.token = null;
  }
}
