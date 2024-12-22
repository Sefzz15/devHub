import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, BehaviorSubject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _url = '/assets/data.json'
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);

  constructor(private _http: HttpClient) {

  }

  authenticate(username: string, password: string): Observable<boolean> {
    return this._http.get<{ username: string; password: string }[]>(this._url).pipe(
      map(users => {
        const user = users.some(u => u.username === username && u.password === password);
        if (user) {
          console.log("truee");
          const token = user;
          this.isAuthenticatedSubject.next(token);
          console.log("Generated Token:", token);
          return token;
        }
        console.log("falsee");
        const token = user;
        this.isAuthenticatedSubject.next(token);
        console.log("Generated Token:", token);
        return token;
      })
    );
  }

  get isAuthenticated(): Observable<boolean> {
    return this.isAuthenticatedSubject.asObservable();
  }

  login(username: string, password: string): boolean {
    if (username === 'test' && password === 'password') {
      this.isAuthenticatedSubject.next(true);
      return true;
    }
    this.isAuthenticatedSubject.next(false);
    return false;
  }

  logout(): boolean {
    this.isAuthenticatedSubject.next(false);
    return false;
  }
}