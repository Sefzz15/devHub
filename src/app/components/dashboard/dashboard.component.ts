import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { SessionService } from '../../../services/session.service';

@Component({
  selector: 'app-dashboard',
  standalone: false,

  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  userID: number = 0;
  username: string = '';

  constructor(
    private _router: Router,
    private _authService: AuthService,
    private _sessionService: SessionService,
  ) { }

  ngOnInit() {
    this.username = this._sessionService.username;
    this.userID = this._sessionService.userID;

    console.log('Username in Dashboard:', this.username);
    console.log('UserID in Dashboard:', this.userID);

  }

  LogOut(): void {
    alert("You successfully logged out...");
    this._authService.logout();
    this._router.navigate(['/']);

  }
}
