import { Component, signal } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { SessionService } from '../../../services/session.service';


@Component({
  standalone: false,
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  readonly username = signal('');
  readonly password = signal('');
  readonly usernameError = signal('');
  readonly passwordError = signal('');
  readonly generalError = signal('');

  constructor(
    private _router: Router,
    private _authService: AuthService,
    private _sessionService: SessionService,
  ) { }

  onSubmit() {
    // Clear any previous error messages
    this.usernameError.set('');
    this.passwordError.set('');
    this.generalError.set('');

    // Check if username and password are provided
    if (!this.username()) {
      this.usernameError.set('Please insert username');
    }

    if (!this.password()) {
      this.passwordError.set('Please insert password');
      return;
    }

    // Proceed with authentication
    this._authService.authenticate(this.username(), this.password()).subscribe({
      next: (isAuthenticated: boolean) => {
        if (isAuthenticated) {
          this._sessionService.username = this.username();
          this._sessionService.userID = this._authService.userID;
          void this._router.navigate(['/dashboard']);
          console.log('You successfully logged in...');
        } else {
          this.generalError.set(this._authService.generalError);
          console.log('Invalid Username and/or password...');
        }
      },
      error: (error: any) => {
        this.generalError.set(this._authService.generalError);
        console.error('Authentication failed due to an error:', error);
      }
    });
  }
}
