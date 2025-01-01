import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../../../services/user.service';

@Component({
  standalone: false,
  selector: 'app-create-user',
  templateUrl: './create-user.component.html',
  styleUrls: ['./create-user.component.css'],
})
export class CreateUserComponent implements OnInit {
  user = { uname: '', upass: '' };
  errorMessage: string = '';
  usernameError: string = '';
  passwordError: string = '';
  successMessage: string = '';

  constructor(private userService: UserService, private router: Router) { }

  ngOnInit(): void {
    // Initialization logic (if needed)
  }

  createUser(): void {
    // Clear previous error messages
    this.usernameError = '';
    this.passwordError = '';
    this.successMessage = '';

    // Basic validation for required fields
    if (!this.user.uname) {
      this.usernameError = 'Username is required.';
    }

    if (!this.user.upass) {
      this.passwordError = 'Password is required.';
      return; // Stop the form submission if there are validation errors
    }

    // Call the service to create the user
    this.userService.createUser(this.user).subscribe(
      (response: any) => {
        // Show success message
        this.successMessage = 'User created successfully. Redirecting...';

        // Set a delay before redirecting
        setTimeout(() => {
          // After 2 seconds, navigate to the first page
          this.router.navigate(['/firstpage']);
        }, 2000); // Adjust the delay time here (2000ms = 2 seconds)
      },
      (error: any) => {
        this.errorMessage = 'Failed to create the user. Please try again later.';
      }
    );
  }

  clearErrorMessage(): void {
    this.errorMessage = '';
  }
}
