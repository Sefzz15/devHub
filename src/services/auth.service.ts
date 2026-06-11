import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { SessionService } from './session.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _url = 'https://localhost:5000/api/users/login'; // Backend URL
  private _url1 = 'https://localhost:5000/api/users'; // Backend URL
  // private _url = 'https://192.168.1.180:5000/api/users/login'; // Backend URL
  private static readonly TOKEN_KEY = 'authToken';
  private readonly _isAuthenticated = signal<boolean>(false);
  /** Reactive auth state. Read as a signal: `authService.isAuthenticated()`. */
  readonly isAuthenticated = this._isAuthenticated.asReadonly();
  private _token: string | null = null;
  userID: number = 0;

  public generalError: string = '';

  constructor(
    private _http: HttpClient,
    private _sessionService: SessionService
  ) {
    // Rehydrate auth state from storage so a page refresh keeps the user logged in.
    const stored = this._readStoredToken();
    if (stored) {
      this._token = stored;
      this._isAuthenticated.set(true);
    }
  }

  /** sessionStorage is unavailable during SSR and may throw if storage is disabled. */
  private _readStoredToken(): string | null {
    if (typeof window === 'undefined') {
      return null;
    }
    try {
      return window.sessionStorage.getItem(AuthService.TOKEN_KEY);
    } catch {
      return null;
    }
  }

  private _persistToken(token: string | null): void {
    this._token = token;
    if (typeof window === 'undefined') {
      return;
    }
    try {
      if (token) {
        window.sessionStorage.setItem(AuthService.TOKEN_KEY, token);
      } else {
        window.sessionStorage.removeItem(AuthService.TOKEN_KEY);
      }
    } catch {
      // Storage disabled (e.g. private mode); fall back to in-memory token only.
    }
  }

  /** Used by the HTTP interceptor to attach credentials to outgoing requests. */
  getToken(): string | null {
    return this._token;
  }

  authenticate(username: string, password: string): Observable<boolean> {
    return this._http.post<{ message: string; token?: string; $id?: number; user: { $id: string; uid: number; uname: string } }>(this._url, { username, password }).pipe(
      map(response => {
        if (response.message === 'Login successful!' && response.token) {
          this.userID = response.user.uid;          // Extract userID
          this._persistToken(response.token);
          this._isAuthenticated.set(true);

          // Update SessionService with the username and userID
          this._sessionService.username = username;  // Set the username
          this._sessionService.userID = this.userID;  // Set the userID

          return true;
        } else {
          this._isAuthenticated.set(false);
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

  logout(): void {
    this._persistToken(null);
    this._isAuthenticated.set(false);
  }
}
