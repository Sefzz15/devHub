import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) { }

  canActivate(): Observable<boolean> {
    return this.authService.isAuthenticated.pipe(
      map(isAuthenticated => {
        console.log('Authentication statuuus:', isAuthenticated);
        if (isAuthenticated) {
          return true; // Allow access
        }
        // Redirect to login if not authenticated
        this.router.navigate(['/login']);
        return false;
      })
    );
  }
}
