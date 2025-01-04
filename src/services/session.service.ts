import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  private _username: string = '';

  set username(value: string) {
    this._username = value;
  }

  get username(): string {
    return this._username;
  }

  clearSession() {
    this._username = '';
  }
}
