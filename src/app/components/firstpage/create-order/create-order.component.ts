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


  order = { oid: 0, uid: 0, date: '' };
  orderoidError: string = '';
  orderuidError: string = '';
  orderdateError: string = '';
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
    console.log('Payload to be sent to backend:', this.order);


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
    this.orderoidError = '';
    this.orderuidError = '';
    this.orderdateError = '';
    this.successMessage = '';
  }

  validateInputs(): boolean {
    let isValid = true;


    if (!this.order.uid) {
      this.orderuidError = 'User  ID is required.';
      isValid = false;
    }
    return isValid;
  }
}
