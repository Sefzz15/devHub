import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: false,

  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent implements OnInit {
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

  LogOut(): void {
    alert("You successfully logged out...");
    this._authService.logout();
    this._router.navigate(['/']);
  }

}
