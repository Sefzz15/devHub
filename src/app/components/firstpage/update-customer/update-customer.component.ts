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
  customer = {
    cid: 0,
    firstname: '',
    lastname: '',
    email: '',
  };

  errorMessage: string = '';
  successMessage: string = '';
  firstnameError: string = '';
  lastnameError: string = '';
  emailError: string = '';
  cityError: string = '';

  constructor(private customerService: CustomerService, private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    const cid = this.route.snapshot.paramMap.get('id');
    if (!cid) {
      this.errorMessage = 'Route parameter "id" is missing or invalid.';
      return;
    }

    const customerId = Number(cid);

    this.customerService.getCustomer(customerId).subscribe(
      (data: any) => {
        this.customer = data;
      },
      (error: any) => {
        this.errorMessage = `Unable to fetch customer data. Error: ${error.message}`;
      }
    );
  }

  updateCustomer(): void {
    this.clearMessages();

    if (!this.validateInputs()) {
      return;
    }

    this.customerService.updateCustomer(this.customer.cid, this.customer).subscribe(
      () => {
        this.errorMessage = '';
        this.successMessage = 'Customer updated successfully.';
        // Redirect after a short delay to show the success message
        setTimeout(() => this.router.navigate(['/firstpage']), 1500);
      },
      (error: any) => {
        this.errorMessage = `Failed to update the customer. Please try again.`;
      }
    );
  }

  validateInputs(): boolean {
    if (!this.customer.firstname) {
      this.firstnameError = 'First name is required.';
    }

    if (!this.customer.lastname) {
      this.lastnameError = 'Last name is required.';
    }

    if (!this.customer.email) {
      this.emailError = 'Email is required.';
    } else if (!this.isValidEmail(this.customer.email)) {
      this.emailError = 'Invalid email format.';
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
