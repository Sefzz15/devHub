import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { NotificationService } from '../../../services/notification.service';
import { ConfirmationService } from '../../../services/confirmation.service';
import { Router } from '@angular/router';

@Component({
  standalone: false,
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  isAuthenticated: boolean = false;

  constructor(
    private _authService: AuthService,
    private _router: Router,
    private _notification: NotificationService,
    private _confirmation: ConfirmationService
  ) {

  }

  ngOnInit(): void {
    this._authService.isAuthenticated.subscribe(token => {
      this.isAuthenticated = token; // Update local state
    });
  }

  onLinkClick(event: MouseEvent): void {
    event.preventDefault();
    if (!this.isAuthenticated) {
      this._notification.warn('Please sign in first.');
    }
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
          this._performLogout();
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
