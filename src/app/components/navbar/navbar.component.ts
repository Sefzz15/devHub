import {Component} from '@angular/core';
import {AuthService} from '../../../services/auth.service';
import {NotificationService} from '../../../services/notification.service';
import {TranslationService} from '../../../services/translation.service';

@Component({
  standalone: false,
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  menuOpen = false;

  constructor(
    private _authService: AuthService,
    private _notification: NotificationService,
    private _i18n: TranslationService
  ) {

  }

  /** Reactive auth state read straight from the AuthService signal. */
  get isAuthenticated(): boolean {
    return this._authService.isAuthenticated();
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }

  onLinkClick(event: MouseEvent): void {
    event.preventDefault();
    if (!this.isAuthenticated) {
      this._notification.warn(this._i18n.translate('nav.signInFirst'));
      return;
    }
    this.closeMenu();
  }
}
