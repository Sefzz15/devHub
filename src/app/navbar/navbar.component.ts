import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  standalone: false,
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  isAuthenticated: boolean = false;

  constructor(private _authService: AuthService,
  ) {

  }
  ngOnInit(): void {
    // Subscribe to the authentication state
    this._authService.isAuthenticated.subscribe(status => {
      this.isAuthenticated = status;
    });
  }

  onLinkClick(event: MouseEvent): void {
    // Prevent default behavior (if needed)
    event.preventDefault();

    // Fetch and log the current authentication state
    this._authService.isAuthenticated.subscribe(token => {
      console.log('Current Token:', token);
    });
  }

  logout(): void {
    this._authService.logout(); // Clear the auth state
  }
}
