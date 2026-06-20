import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { NotificationService } from '../../../services/notification.service';
import { ConfirmationService } from '../../../services/confirmation.service';
import { TranslationService } from '../../../services/translation.service';
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
    private _confirmation: ConfirmationService,
    private _i18n: TranslationService
  ) {

  }

  /** Reactive auth state read straight from the AuthService signal. */
  get isAuthenticated(): boolean {
    return this._authService.isAuthenticated();
  }

  LogOut(): void {
    this._confirmation
      .confirm({
        title: this._i18n.translate('footer.logoutTitle'),
        message: this._i18n.translate('footer.logoutConfirm'),
        confirmText: this._i18n.translate('footer.logoutTitle'),
        cancelText: this._i18n.translate('common.cancel'),
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
        this._notification.success(this._i18n.translate('footer.loggedOut'));
      } else {
        this._notification.error(this._i18n.translate('footer.redirectFailed'));
      }
    } catch (err) {
      console.error('Navigation error:', err);
      this._notification.error(this._i18n.translate('footer.redirectError'));
    }
  }
}
