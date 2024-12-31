import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../../services/user.service';

@Component({
  standalone: false,
  selector: 'app-create-user',
  templateUrl: './create-user.component.html',
  styleUrls: ['./create-user.component.css'],
})
export class CreateUserComponent implements OnInit {
  user = { uid: 0, uname: '', upass: '' };
  errorMessage: string = '';
  usernameError: string = '';
  passwordError: string = '';

  constructor(private userService: UserService, private router: Router) { }

  ngOnInit(): void {
    // Initialize any logic needed when the component is loaded
  }

  createUser(): void {
    this.usernameError = '';
    this.passwordError = '';

    if (!this.user.uname) {
      this.usernameError = 'Username is required.';
    }

    if (!this.user.upass) {
      this.passwordError = 'Password is required.';
      return;
    }

    // Call the service to create the user
    this.userService.createUser(this.user).subscribe(
      (response: any) => {
        // Navigate to a user list or success page
        this.router.navigate(['/firstpage']);
      },
      (error: any) => {
        this.errorMessage = 'Failed to create the user.';
      }
    );
  }

  clearErrorMessage(): void {
    this.errorMessage = '';
  }
}
