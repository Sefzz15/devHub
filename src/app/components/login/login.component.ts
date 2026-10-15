import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../../pipes/translate.pipe';
import { Component, signal, inject } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { SessionService } from '../../../services/session.service';
import { TranslationService } from '../../../services/translation.service';
import { EntityFormService } from '../../../services/entity-form.service';


@Component({
  standalone: true,
  imports: [FormsModule, TranslatePipe],
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

  private readonly _router = inject(Router);
  private readonly _authService = inject(AuthService);
  private readonly _sessionService = inject(SessionService);
  private readonly _translation = inject(TranslationService);
  private readonly _entityForm = inject(EntityFormService);

  /** Sign-up: the same form the admin page uses, opened over the login screen. */
  openRegister(): void {
    this._entityForm.open('user').subscribe();
  }

  onSubmit() {
    // Clear any previous error messages
    this.usernameError.set('');
    this.passwordError.set('');
    this.generalError.set('');

    // Check if username and password are provided
    if (!this.username()) {
      this.usernameError.set(this._translation.translate('login.errUsername'));
    }

    if (!this.password()) {
      this.passwordError.set(this._translation.translate('login.errPassword'));
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
