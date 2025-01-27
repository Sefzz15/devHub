import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { OrderService } from '../../../../services/order.service';

@Component({
  selector: 'app-create-order',
  standalone: false,

  templateUrl: './create-order.component.html',
  styleUrls: ['../../firstpage/create-user/create-user.component.css'],
})
export class CreateOrderComponent {


  order = { pid: '', cid: '', quantity: '' };
  orderpidError: string = '';
  ordercidError: string = '';
  orderquantityError: string = '';
  successMessage: string = '';
  errorMessage: string = '';
  generalError: string = '';

  constructor(
    private orderService: OrderService,
    private router: Router
  ) { }

  ngOnInit(): void {
  }

  createOrder(): void {
    this.clearErrorMessages();

    if (!this.validateInputs()) {
      return; // If validation fails, stop the form submission
    }

    // Call the service to create the order
    this.orderService.createOrder(this.order).subscribe(
      (response: any) => {
        this.errorMessage = '';
        this.successMessage = 'Order created successfully. Redirecting...';

        // Set a delay before redirecting
        setTimeout(() => {
          // After 1,5 seconds, navigate to the first page
          this.router.navigate(['/firstpage']);
        }, 1500);
      },
      (error: any) => {
        this.errorMessage = 'Failed to create the order. Please try again later.';
      }
    );
  }

  clearErrorMessages(): void {
    this.ordercidError = '';
    this.orderpidError = '';
    this.orderquantityError = '';
    this.successMessage = '';
  }

  validateInputs(): boolean {
    let isValid = true;


    if (!this.order.cid) {
      this.ordercidError = 'Customer  ID is required.';
      isValid = false;
    }

    if (!this.order.pid) {
      this.orderpidError = 'Product ID is required.';
      isValid = false;
    }

    if (!this.order.quantity) {
      this.orderquantityError = 'Stock Quantity is required.';
      isValid = false;
    }

    return isValid;
  }
}
