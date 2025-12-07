import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
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
    private _router: Router
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
      alert("You have to sign in first");
    }
    console.log('Current Token:', this.isAuthenticated);
  }

  async LogOut(): Promise<void> {
    this._authService.logout();

    try {
      const ok = await this._router.navigate(['/login']);
      if (ok) {
        alert('You successfully logged out...');
      } else {
        alert('You are logged out, but redirect failed.');
      }
    } catch (err) {
      console.error('Navigation error:', err);
      alert('You are logged out, but something went wrong while redirecting.');
    }
  }
}
