import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http'; // Import HttpClientModule

@Component({
  selector: 'app-dashboard',
  standalone: false,

  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  constructor(private _router: Router) {

  }
  LogOut() {
    this._router.navigate(['/login']);
    console.log('you successfully logged out...');
  }
}