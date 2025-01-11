import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  standalone: false,
  selector: 'app-create-customer',
  templateUrl: './create-customer.component.html',
  styleUrls: ['../../firstpage/create-user/create-user.component.css'],
})
export class CreateCustomerComponent implements OnInit {
  customer = { first_name: '', last_name: '', email: '', phone: '', address: '', city: '' };
  firstNameError: string = '';
  lastNameError: string = '';
  emailError: string = '';
  cityError: string = '';
  errorMessage: string = '';
  successMessage: string = '';

  constructor(private http: HttpClient, private router: Router) { }

  ngOnInit(): void {
    console.log('CreateCustomerComponent initialized');
  }

  createCustomer(): void {
    console.log('createCustomer() called');

    // Clear previous error messages
    this.clearMessages();

    // Validate the form
    if (this.isFormInvalid()) {
      console.log('Form validation failed', {
        errors: {
          firstNameError: this.firstNameError,
          lastNameError: this.lastNameError,
          emailError: this.emailError,
          cityError: this.cityError,
        },
      });
      return;  // If validation fails, stop form submission
    }

    const payload = {
      first_name: this.customer.first_name,
      last_name: this.customer.last_name,
      email: this.customer.email,
      phone: this.customer.phone,
      address: this.customer.address,
      city: this.customer.city
    };

    console.log('Payload to be sent to the API:', payload);

    this.http.post('https://localhost:5000/api/customer/create-user-and-customer', payload).subscribe(
      (response: any) => {
        console.log('API response:', response);
        this.successMessage = 'Customer created successfully.';
        setTimeout(() => {
          console.log('Navigating to /firstpage');
          this.router.navigate(['/firstpage']);
        }, 1500);
      },
      (error: any) => {
        console.error('API error:', error);
        this.errorMessage = `Failed to create the customer. Please try again later.`;
      }
    );
  }

  isFormInvalid(): boolean {
    let isValid = true;

    if (!this.customer.first_name) {
      this.firstNameError = 'First name is required.';
      console.log('Validation error: First name is missing');
      isValid = false;
    }

    if (!this.customer.last_name) {
      this.lastNameError = 'Last name is required.';
      console.log('Validation error: Last name is missing');
      isValid = false;
    }

    if (!this.customer.email) {
      this.emailError = 'Email is required.';
      console.log('Validation error: Email is missing');
      isValid = false;
    } else if (!this.isValidEmail(this.customer.email)) {
      this.emailError = 'Please enter a valid email address.';
      console.log('Validation error: Email is invalid');
      isValid = false;
    }

    if (!this.customer.city) {
      this.cityError = 'City is required.';
      console.log('Validation error: City is missing');
      isValid = false;
    }

    console.log('Form validation result:', isValid);
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
    console.log('Clearing all messages');
    this.firstNameError = '';
    this.lastNameError = '';
    this.emailError = '';
    this.cityError = '';
    this.successMessage = '';
    this.errorMessage = '';
  }
}
