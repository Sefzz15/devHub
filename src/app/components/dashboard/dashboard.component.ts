import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: false,

  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  constructor(private _router: Router,
    private _authService: AuthService,

  ) {

  }
  LogOut() {
    this._router.navigate(['/login']);
    console.log('you successfully logged out...');
    this._authService.logout();
  }
}