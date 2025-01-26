import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { OrderService } from '../../../../services/order.service';

@Component({
  selector: 'app-create-order',
  standalone: false,
  
  templateUrl: './create-order.component.html',
  styleUrl: './create-order.component.css'
})
export class CreateOrderComponent {

 
  order = { oid: 0, pid: 0,  cid: 0, date : '', quantity: 0 };
  orderidError: string = '';
  orderdateError: string = '';
  orderquantityError: string = '';
  successMessage: string = '';
  errorMessage: string = '';
  generalError: string = '';

  constructor(private orderService: OrderService, private router: Router) { }

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
    this.orderidError = '';
    this.orderdateError = '';
    this.orderquantityError = '';
    this.successMessage = '';
  }

  validateInputs(): boolean {
    let isValid = true;

    if (!this.order.cid) {0
      this.orderidError = 'Orderid is required.';
      isValid = false;
    }

    if (!this.order.date) {
      this.orderdateError = 'Order Date is required.';
      isValid = false;
    }

    if (!this.order.quantity) {
      this.orderquantityError = 'Stock Quantity is required.';
      isValid = false;
    }

    return isValid;
  }
}
