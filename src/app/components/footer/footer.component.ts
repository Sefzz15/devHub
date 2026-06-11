import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { NotificationService } from '../../../services/notification.service';
import { ConfirmationService } from '../../../services/confirmation.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: false,

  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
  constructor(
    private _authService: AuthService,
    private _router: Router,
    private _notification: NotificationService,
    private _confirmation: ConfirmationService
  ) {

  }

  /** Reactive auth state read straight from the AuthService signal. */
  get isAuthenticated(): boolean {
    return this._authService.isAuthenticated();
  }

  LogOut(): void {
    this._confirmation
      .confirm({
        title: 'Log out',
        message: 'Do you want to log out?',
        confirmText: 'Log out',
        confirmColor: 'primary',
      })
      .subscribe(confirmed => {
        if (confirmed) {
          void this._performLogout();
        }
      });
  }

  private async _performLogout(): Promise<void> {
    this._authService.logout();

    try {
      const ok = await this._router.navigate(['/login']);
      if (ok) {
        this._notification.success('You have been logged out.');
      } else {
        this._notification.error('You are logged out, but the redirect failed.');
      }
    } catch (err) {
      console.error('Navigation error:', err);
      this._notification.error('You are logged out, but something went wrong while redirecting.');
    }
  }
}
