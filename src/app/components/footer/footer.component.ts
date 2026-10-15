import { TranslatePipe } from '../../../pipes/translate.pipe';
import { Component, inject } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { NotificationService } from '../../../services/notification.service';
import { ConfirmationService } from '../../../services/confirmation.service';
import { TranslationService } from '../../../services/translation.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [TranslatePipe],

  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
  private readonly _authService = inject(AuthService);
  private readonly _router = inject(Router);
  private readonly _notification = inject(NotificationService);
  private readonly _confirmation = inject(ConfirmationService);
  private readonly _translation = inject(TranslationService);

  /** Reactive auth state read straight from the AuthService signal. */
  get isAuthenticated(): boolean {
    return this._authService.isAuthenticated();
  }

  LogOut(): void {
    this._confirmation
      .confirm({
        title: this._translation.translate('footer.logoutTitle'),
        message: this._translation.translate('footer.logoutConfirm'),
        confirmText: this._translation.translate('footer.logoutTitle'),
        cancelText: this._translation.translate('common.cancel'),
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
        this._notification.success(this._translation.translate('footer.loggedOut'));
      } else {
        this._notification.error(this._translation.translate('footer.redirectFailed'));
      }
    } catch (err) {
      console.error('Navigation error:', err);
      this._notification.error(this._translation.translate('footer.redirectError'));
    }
  }
}
