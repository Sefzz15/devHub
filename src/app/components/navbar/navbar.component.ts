import { RouterLink } from '@angular/router';
import { LanguageToggleComponent } from '../language-toggle/language-toggle.component';
import { TranslatePipe } from '../../../pipes/translate.pipe';
import {Component, inject } from '@angular/core';
import {AuthService} from '../../../services/auth.service';
import {NotificationService} from '../../../services/notification.service';
import {TranslationService} from '../../../services/translation.service';

@Component({
  standalone: true,
  imports: [RouterLink, TranslatePipe, LanguageToggleComponent],
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  menuOpen = false;

  private readonly _authService = inject(AuthService);
  private readonly _notification = inject(NotificationService);
  private readonly _translation = inject(TranslationService);

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
      this._notification.warn(this._translation.translate('nav.signInFirst'));
      return;
    }
    this.closeMenu();
  }
}
