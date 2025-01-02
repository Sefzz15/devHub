import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomerService } from '../../../../services/customer.service';

@Component({
  standalone: false,
  selector: 'app-update-customer',
  templateUrl: './update-customer.component.html',
  styleUrls: ['../../firstpage/create-user/create-user.component.css'],
})
export class UpdateCustomerComponent implements OnInit {
  customer = { c_id: 0, first_name: '', last_name: '', email: '', phone: '', address: '', city: '' };
  errorMessage: string = '';
  successMessage: string = '';
  firstnameError: string = '';
  lastnameError: string = '';
  emailError: string = '';
  cityError: string = '';

  constructor(private customerService: CustomerService, private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    const c_id = this.route.snapshot.paramMap.get('id');
    if (!c_id) {
      this.errorMessage = 'Route parameter "id" is missing or invalid.';
      return;
    }

    const customerId = Number(c_id);

    this.customerService.getCustomer(customerId).subscribe(
      (data: any) => {
        this.customer = data;
      },
      (error: any) => {
        this.errorMessage = `Unable to fetch customer details. Error: ${error.message}`;
      }
    );
  }

  updateCustomer(): void {
    this.clearMessages();

    if (!this.validateInputs()) {
      return;
    }

    this.customerService.updateCustomer(this.customer.c_id, this.customer).subscribe(
      () => {
        this.successMessage = 'Customer updated successfully.';
        // Redirect after a short delay to show the success message
        setTimeout(() => this.router.navigate(['/secondpage']), 1500);
      },
      (error: any) => {
        this.errorMessage = `Failed to update the customer. Error: ${error.message}`;
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
