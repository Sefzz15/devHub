import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  standalone: false,
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  isAuthenticated: boolean = false;

  constructor(private _authService: AuthService,
    private _router: Router,

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

  LogOut() {
    this._router.navigate(['/login']);
    console.log('you successfully logged out...');
    this._authService.logout();
  }
}
