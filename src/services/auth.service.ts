import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _url = 'https://localhost:5000/api/users';
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private token: string | null = null;

  constructor(private _http: HttpClient) {}

  authenticate(username: string, password: string): Observable<boolean> {
    return this._http.post<{ token: string }>(this._url, { username, password }).pipe(
      map(response => {
        if (response.token) {
          this.token = response.token;
          this.isAuthenticatedSubject.next(true);
          console.log("Authenticated successfully, Token:", this.token);
          return true;
        } else {
          console.log("Authentication failed");
          this.isAuthenticatedSubject.next(false);
          return false;
        }
      })
    );
  }

  get isAuthenticated(): Observable<boolean> {
    return this.isAuthenticatedSubject.asObservable();
  }

  login(username: string, password: string): boolean {
    return false;
  }

  logout(): void {
    this.isAuthenticatedSubject.next(false);
    this.token = null;
  }
}
