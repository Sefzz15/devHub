import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { SessionService } from '../../../../services/session.service';
import { CustomerService } from '../../../../services/customer.service';

@Component({
  standalone: false,
  selector: 'app-create-customer',
  templateUrl: './create-customer.component.html',
  styleUrls: ['../../firstpage/create-user/create-user.component.css'],
})
export class CreateCustomerComponent implements OnInit {
  userID: number = 0;
  customer = {
    uid: this.userID,
    firstname: '',
    lastname: '',
    email: ''
  };


  firstNameError: string = '';
  lastNameError: string = '';
  emailError: string = '';
  cityError: string = '';
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    private _sessionService: SessionService,
    private customerService: CustomerService
  ) { }

  ngOnInit(): void {
    this.userID = this._sessionService.userID;
    this.customer.uid = this.userID;

    console.log('Component initialized: UserID in CreateCustomer:', this.userID);
    console.log('Initial customer object:', this.customer);
  }

  createCustomer(): void {
    this.clearMessages();
    console.log('Payload to be sent to backend:', this.customer);

    if (!this.validateInputs()) {
      console.log('Validation failed. Form submission halted.');
      return;
    }

    this.customerService.createCustomer(this.customer).subscribe({
      next: (response: any) => {
        console.log('Response from backend:', response);
        this.errorMessage = '';
        this.successMessage = 'Customer created successfully. Redirecting...';

        setTimeout(() => {
          console.log('Redirecting to /firstpage...');
          this.router.navigate(['/firstpage']);
        }, 2000);
      },
      error: (error: any) => {
        console.error('Error from backend:', error);
        this.errorMessage = 'Failed to create the customer.';

        if (error.error?.errors) {
          const errors = error.error.errors;
          console.log('Validation errors from backend:', errors);

          if (errors.firstname) {
            this.firstNameError = errors.firstname[0];
          }
          if (errors.lastname) {
            this.lastNameError = errors.lastname[0];
          }
          if (errors.email) {
            this.emailError = errors.email[0];
          }
          if (errors.city) {
            this.cityError = errors.city[0];
          }
        }
      },
    });
  }

  validateInputs(): boolean {
    let isValid = true;

    if (!this.customer.firstname) {
      this.firstNameError = 'First name is required.';
      isValid = false;
    }

    if (!this.customer.lastname) {
      this.lastNameError = 'Last name is required.';
      isValid = false;
    }

    if (!this.customer.email) {
      this.emailError = 'Email is required.';
      isValid = false;
    } else if (!this.isValidEmail(this.customer.email)) {
      this.emailError = 'Please enter a valid email address.';
      isValid = false;
    }


    return isValid;
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const isValid = emailRegex.test(email);
    if (!isValid) {
      console.log('Invalid email format:', email);
    }
    return isValid;
  }

  clearMessages(): void {
    console.log('Clearing messages...');
    this.firstNameError = '';
    this.lastNameError = '';
    this.emailError = '';
    this.cityError = '';
    this.successMessage = '';
    this.errorMessage = '';
  }
}
