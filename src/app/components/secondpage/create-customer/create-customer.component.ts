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

    if (!this.validateInputs()) {
      return;
    }

    this.customerService.createCustomer(this.customer).subscribe(
      () => {
        this.successMessage = 'Customer created successfully.';
        // Redirect after a short delay to show the success message
        setTimeout(() => this.router.navigate(['/secondpage']), 1500);
      },
      (error: any) => {
        this.errorMessage = `Failed to create the customer. Error: ${error.message}`;
      }
    );
  }

  validateInputs(): boolean {
    if (!this.customer.first_name) {
      this.firstnameError = 'First name is required.';
    }

    if (!this.customer.last_name) {
      this.lastnameError = 'Last name is required.';
    }

    if (!this.customer.email) {
      this.emailError = 'Email is required.';
    } else if (!this.isValidEmail(this.customer.email)) {
      this.emailError = 'Invalid email format.';
    }

    if (!this.customer.city) {
      this.cityError = 'City is required.';
    }

    return !this.firstnameError && !this.lastnameError && !this.emailError && !this.cityError;
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
