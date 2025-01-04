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
  usernameError: string = '';
  passwordError: string = '';
  successMessage: string = '';
  errorMessage: string = '';
  generalError: string = '';

  constructor(private userService: UserService, private router: Router) { }

  ngOnInit(): void {
    // Initialization logic (if needed)
  }

  createUser(): void {
    // Clear previous error messages
    this.clearErrorMessages();

    // Validate user inputs
    if (!this.validateInputs()) {
      return; // If validation fails, stop the form submission
    }

    // Call the service to create the user
    this.userService.createUser(this.user).subscribe(
      (response: any) => {
        // Show success message
        this.errorMessage = '';
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

  clearErrorMessages(): void {
    this.usernameError = '';
    this.passwordError = '';
    this.successMessage = '';
  }

  validateInputs(): boolean {
    let isValid = true;

    // Username validation
    if (!this.user.uname) {
      this.usernameError = 'Username is required.';
      isValid = false;
    }

    // Password validation
    if (!this.user.upass) {
      this.passwordError = 'Password is required.';
      isValid = false;
    }

    return isValid;
  }
}
