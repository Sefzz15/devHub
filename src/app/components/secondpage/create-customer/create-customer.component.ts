import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CustomerService } from '../../../../services/customer.service';

@Component({
  standalone: false,
  selector: 'app-create-customer',
  templateUrl: './create-customer.component.html',
  styleUrls: ['../../firstpage/create-user/create-user.component.css'],
})
export class CreateCustomerComponent implements OnInit {
  customer = { first_name: '', last_name: '', email: '', phone: '', address: '', city: '' };
  errorMessage: string = '';
  successMessage: string = '';
  firstnameError: string = '';
  lastnameError: string = '';
  emailError: string = '';
  cityError: string = '';

  constructor(private customerService: CustomerService, private router: Router) { }

  ngOnInit(): void {
    // Initialization code here (if needed)
  }

  createCustomer(): void {
    this.clearMessages();

    // Ensure that validation errors prevent form submission
    if (!this.validateInputs()) {
      return;  // If validation fails, stop further execution
    }

    // If validation passes, proceed with customer creation
    this.customerService.createCustomer(this.customer).subscribe(
      () => {
        this.errorMessage = '';
        this.successMessage = 'Customer created successfully.';
        // Redirect after a short delay to show the success message
        setTimeout(() => this.router.navigate(['/secondpage']), 1500);
      },
      (error: any) => {
        this.errorMessage = `Failed to create the customer. Customer with that e-mail already exists.`;
      }
    );
  }

  validateInputs(): boolean {
    let isValid = true;

    // Clear previous error messages
    this.firstnameError = '';
    this.lastnameError = '';
    this.emailError = '';
    this.cityError = '';

    // Validate fields and set errors if any
    if (!this.customer.first_name) {
      this.firstnameError = 'First name is required.';
      isValid = false;
    }

    if (!this.customer.last_name) {
      this.lastnameError = 'Last name is required.';
      isValid = false;
    }

    if (!this.customer.email) {
      this.emailError = 'Email is required.';
      isValid = false;
    } else if (!this.isValidEmail(this.customer.email)) {
      this.emailError = 'Invalid email format.';
      isValid = false;
    }

    if (!this.customer.city) {
      this.cityError = 'City is required.';
      isValid = false;
    }

    return isValid; // Return false if any field is invalid
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.firstnameError = '';
    this.lastnameError = '';
    this.emailError = '';
    this.cityError = '';
  }
}
