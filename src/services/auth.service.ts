import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _url = '/assets/data.json'
  constructor(private _http: HttpClient) {

  }

  authenticate(username: string, password: string): Observable<boolean> {
    return this._http.get<{ username: string; password: string }[]>(this._url).pipe(
      map(users => users.some(user => user.username === username && user.password === password))
    );
  }
}
