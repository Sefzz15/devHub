import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  standalone: false,
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  usernameError: string = '';
  passwordError: string = '';
  generalError: string = ''; // New variable for general error message

  constructor(
    private _router: Router,
    private _authService: AuthService
  ) {}

  onSubmit() {
    this._authService.authenticate(this.username, this.password).subscribe((isAuthenticated) => {
      console.log('Authentication response:', isAuthenticated); // Log the response for debugging
      if (isAuthenticated) {
        this._router.navigate(['/dashboard']);
        console.log('You successfully logged in...');
      } else {
        alert('Invalid Username and/or password!');
        console.log('Invalid Username and/or password...');
      }
    });
  }
  
}