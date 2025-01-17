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
  customer = { uid: this.userID, first_name: '', last_name: '', email: '', phone: '', address: '', city: '' };
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
    // Clear previous error messages
    this.clearMessages();
    console.log('Payload to be sent to backend:', this.customer);  // Ελέγξτε αν εκτυπώνεται το payload

    // Validate customer inputs
    console.log('Validating customer inputs...');
    if (!this.validateInputs()) {
      console.log('Validation failed.');
      return; // If validation fails, stop the form submission
    }

    console.log('Inputs validated successfully. Proceeding to make HTTP request to backend');

    // Call the service to create the customer
    this.customerService.createCustomer(this.customer).subscribe(
      (response: any) => {
        console.log('Response from backend:', response);  // Ελέγξτε αν υπάρχει απόκριση
        this.errorMessage = '';
        this.successMessage = 'Customer created successfully. Redirecting...';

        setTimeout(() => {
          console.log('Redirecting to /firstpage...');
          this.router.navigate(['/firstpage']);
        }, 2000);
      },
      (error: any) => {
        console.error('Error from backend:', error);  // Αν υπάρχει σφάλμα
        this.errorMessage = 'Failed to create the customer. Please try again later.';
      }
    );
  }

  validateInputs(): boolean {
    let isValid = true;

    if (!this.customer.first_name) {
      this.firstNameError = 'Username is required.';
      isValid = false;
    }

    if (!this.customer.last_name) {
      this.lastNameError = 'Password is required.';
      isValid = false;
    }

    if (!this.customer.email) {
      this.emailError = 'Email is required.';
      isValid = true;
      console.log('Email is missing!');
    } else if (!this.isValidEmail(this.customer.email)) {
      this.emailError = 'Please enter a valid email address.';
      isValid = true;
      console.log('Invalid email format:', this.customer.email);
    } else {
      console.log('Email:', this.customer.email);
    }

    if (!this.customer.city) {
      this.cityError = 'City is required.';
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
