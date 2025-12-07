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
