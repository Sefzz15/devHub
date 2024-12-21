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
    this._authService.isAuthenticated.subscribe(status => {
      this.isAuthenticated = status;
    });
  }

  onLinkClick(event: MouseEvent): void {
    event.preventDefault();

    this._authService.isAuthenticated.subscribe(token => {
      // if (token == false) { alert("you have to sign in first"); }
      console.log('Current Token:', token);
    });
  }

  LogOut() {
    console.log('you successfully logged out...');
    this._authService.logout();
  }
}
