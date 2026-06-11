import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  standalone: false,
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  constructor(
    private _authService: AuthService,
    private _notification: NotificationService
  ) {

  }

  /** Reactive auth state read straight from the AuthService signal. */
  get isAuthenticated(): boolean {
    return this._authService.isAuthenticated();
  }

  onLinkClick(event: MouseEvent): void {
    event.preventDefault();
    if (!this.isAuthenticated) {
      this._notification.warn('Please sign in first.');
    }
  }
}
