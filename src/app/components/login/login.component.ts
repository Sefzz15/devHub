import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { SessionService } from '../../../services/session.service';
import { UserService } from '../../../services/user.service';
import { IUser } from '../../../interfaces/IUser';


@Component({
  standalone: false,
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  userID: number = 0;
  username: string = '';
  password: string = '';
  usernameError: string = '';
  passwordError: string = '';
  generalError: string = '';

  constructor(
    private _router: Router,
    private _authService: AuthService,
    private _sessionService: SessionService,
  ) { }

  onSubmit() {
    // Clear any previous error messages
    this.usernameError = '';
    this.passwordError = '';
    this.generalError = '';

    // Check if username and password are provided
    if (!this.username) {
      this.usernameError = 'Please insert username';
    }

    if (!this.password) {
      this.passwordError = 'Please insert password';
      return;
    }

    // Proceed with authentication
    this._authService.authenticate(this.username, this.password).subscribe(
      (isAuthenticated) => {
        if (isAuthenticated) {
          this._sessionService.username = this.username;
          this._sessionService.userID = this._authService.userID; 
          this._router.navigate(['/dashboard']);
          console.log('You successfully logged in...');
        } else {
          this.generalError = this._authService.generalError;
          console.log('Invalid Username and/or password...');
        }
      },
      (error) => {
        this.generalError = this._authService.generalError;
        console.error('Authentication failed due to an error:', error);
      }
    );
  }

  // getUserId() {
  //   this.userService.getUserIdByUsername(this.username).subscribe(
  //     (response: IUser) => {
  //       this._sessionService.userID = this.userID; // Store userId in session service
  //       // this._sessionService.userID = response.uid; // Store userId in session service
  //       // this.userID = response.uid; // Store userId in component
  //     },
  //     (error) => {
  //       this.userID = 0; // Reset userId on error
  //     }
  //   );
  // }
}
