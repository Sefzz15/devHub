import { NgModule } from '@angular/core';
import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';

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
    private authService: AuthService,
  ) {

  }

  /*onSubmit() {
    if (this.username === 'admin' && this.password === 'admin') {
      this._router.navigate(['/dashboard']);
      console.log('You successfully logged in...');
    }
    else {
      alert('Invalid Username and/or password!');
      console.log('Invalid Username and/or password...');
    }
  }*/


  onSubmit() {
    this.authService.authenticate(this.username, this.password).subscribe(isAuthenticated => {
      if (isAuthenticated) {
        this._router.navigate(['/dashboard']);
      } else {
        alert('Invalid username or password');
      }
    });
  }
}

