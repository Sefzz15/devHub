import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  private _username: string = '';
  private _userID: number = 0;

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

  clearSession() {
    this._username = '';
    this._userID = 0;
  }
}
