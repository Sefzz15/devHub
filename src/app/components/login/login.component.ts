import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-login',
  standalone: false,

  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  /**
   *
   */
  constructor(private _router: Router,
    private _http: HttpClient,
    private _authService: AuthService,
  ) {

  }

  onSubmit() {
    this._authService.authenticate(this.username, this.password).subscribe((isAuthenticated) => {
      if (isAuthenticated) {
        this._router.navigate(['/dashboard']);
        console.log('You successfully logged in...');
      } else {
        alert('Invalid Username and/or password!');
        console.log('Invalid Username and/or password...');
      }
    });
  }

  mynameisjeff() {
    this._http.get('/assets/data.json').subscribe(
      data => {
        // Parse and display the data in an alert
        alert(JSON.stringify(data, null, 2)); // Pretty print JSON
        console.log('Print JSON objects');
      },
      error => {
        alert('Error fetching the JSON file:\n\n ' + error.message);
        console.log('Error printing JSON objects');
      }
    );
  }
}

