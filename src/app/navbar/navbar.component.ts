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

  LogOut(): void {
    console.log('You successfully logged out...');
    alert("ekanes log out");
    this._authService.logout();
  }
}
