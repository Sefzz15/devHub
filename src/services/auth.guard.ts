import { Injectable, inject } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  private readonly _authService = inject(AuthService);
  private readonly _router = inject(Router);

  canActivate(): boolean {
    if (this._authService.isAuthenticated()) {
      return true;
    }
    void this._router.navigate(['/login']);
    return false;
  }
}
