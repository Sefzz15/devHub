import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, BehaviorSubject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _url = '/assets/data.json'
  private isAuthenticatedSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  constructor(private _http: HttpClient) {

  }

  // authenticate(username: string, password: string): Observable<boolean> {
  //   return this._http.get<{ username: string; password: string }[]>(this._url).pipe(
  //     map(users => users.some(user => user.username === username && user.password === password))
  //   );
  // }

  // authenticate(username: string, password: string): Observable<boolean> {
  //   return this._http.get<{ username: string; password: string }[]>(this._url).pipe(
  //     map(users => {
  //       const user = users.some(u => u.username === username && u.password === password);
  //       if (user) {
  //         console.log("truee");
  //         return true;
  //       }
  //       else {
  //         console.log("falsee");
  //         return false;
  //       }
  //     })
  //   );
  // }

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

  // Get the current authentication status
  get isAuthenticated(): Observable<boolean> {
    return this.isAuthenticatedSubject.asObservable();
  }

  logout(): void {
    this.isAuthenticatedSubject.next(false);
  }
}
