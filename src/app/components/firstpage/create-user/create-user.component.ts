import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../../../services/user.service';
import { IUser } from '../../../../interfaces/IUser';

@Component({
  standalone: false,
  selector: 'app-create-user',
  templateUrl: './create-user.component.html',
  styleUrls: ['./create-user.component.css'],
})
export class CreateUserComponent implements OnInit {
  user = { uid: 0, uname: '', upass: '' };
  usernameError: string = '';
  passwordError: string = '';
  successMessage: string = '';
  errorMessage: string = '';
  generalError: string = '';

  constructor(
    private userService: UserService,
    private router: Router
  ) { }

  ngOnInit(): void {
  }

  createUser(): void {
    this.clearErrorMessages();
        console.log('Payload to be sent to backend:', this.user);


    // Validate user inputs
    if (!this.validateInputs()) {
      return; // If validation fails, stop the form submission
    }

    this.userService.createUser(this.user).subscribe(
      (response: IUser) => {
        this.errorMessage = '';
        this.successMessage = 'User created successfully. Redirecting...';

        // Set a delay before redirecting
        setTimeout(() => {
          // After 1,5 seconds, navigate to the first page
          this.router.navigate(['/firstpage']);
        }, 1500);
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

    if (!this.user.uname) {
      this.usernameError = 'Username is required.';
      isValid = false;
    }

    if (!this.user.upass) {
      this.passwordError = 'Password is required.';
      isValid = false;
    }

    return isValid;
  }
}
