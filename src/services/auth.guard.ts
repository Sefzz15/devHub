import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private _authService: AuthService,
    private _router: Router
  ) { }

  canActivate(): boolean {
    const token = this._authService.getToken();
    if (!token) {
      this._router.navigate(['/login']);
      return false;
    }

    const payload = JSON.parse(atob(token.split('.')[1]));
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) {
      this._authService.logout();
      this._router.navigate(['/login']);
      return false;
    }

    return true;
  }
}