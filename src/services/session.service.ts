import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  private static readonly USERNAME_KEY = 'sessionUsername';
  private static readonly USERID_KEY = 'sessionUserID';

  private _username: string = '';
  private _userID: number = 0;

  constructor() {
    this._username = this._read(SessionService.USERNAME_KEY) ?? '';
    this._userID = Number(this._read(SessionService.USERID_KEY)) || 0;
  }

  set username(value: string) {
    this._username = value;
    this._write(SessionService.USERNAME_KEY, value);
  }

  get username(): string {
    return this._username;
  }

  set userID(value: number) {
    this._userID = value;
    this._write(SessionService.USERID_KEY, String(value));
  }

  get userID(): number {
    return this._userID;
  }

  clearSession() {
    this._username = '';
    this._userID = 0;
    this._remove(SessionService.USERNAME_KEY);
    this._remove(SessionService.USERID_KEY);
  }

  /** sessionStorage is unavailable during SSR and may throw if storage is disabled. */
  private _read(key: string): string | null {
    if (typeof window === 'undefined') {
      return null;
    }
    try {
      return window.sessionStorage.getItem(key);
    } catch {
      return null;
    }
  }

  private _write(key: string, value: string): void {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      window.sessionStorage.setItem(key, value);
    } catch {
      // Storage disabled (e.g. private mode); keep the in-memory value only.
    }
  }

  private _remove(key: string): void {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      window.sessionStorage.removeItem(key);
    } catch {
      // Storage disabled; nothing to clear.
    }
  }
}
