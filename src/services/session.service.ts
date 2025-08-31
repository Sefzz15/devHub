import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  private _username: string = '';
  private _userID: number = 0;
  private _token: string | null = null;

  set username(value: string) {
    this._username = value;
  }

  get username(): string {
    return this._username;
  }

  set userID(value: number) {
    this._userID = value;
  }

  get userID(): number {
    return this._userID;
  }

  set token(value: string | null) {
    this._token = value;
    if (value) localStorage.setItem('accessToken', value);
    else localStorage.removeItem('accessToken');
  }
  get token(): string | null {
    return this._token || localStorage.getItem('accessToken');
  }

  clearSession() {
    this._username = '';
    this._userID = 0;
    this.token = null;
  }
}
