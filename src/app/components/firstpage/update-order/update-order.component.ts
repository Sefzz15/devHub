import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService } from '../../../../services/order.service';
import { IOrder } from '../../../../interfaces/IOrder';

@Component({
  standalone: false,
  selector: 'app-update-order',
  templateUrl: './update-order.component.html',
  styleUrls: ['../../firstpage/create-user/create-user.component.css'],
})
export class UpdateOrderComponent implements OnInit {
  order = { oid: 0, cid: 0, pid: 0, quantity: 0, ooid:0, date:'' };

  orderoidError: string = '';
  ordercidError: string = '';
  orderpidError: string = '';
  orderquantityError: string = '';
  successMessage: string = '';
  errorMessage: string = '';
  generalError: string = '';

  constructor(
    private orderService: OrderService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    const oid = this.route.snapshot.paramMap.get('id');
    console.log('Route ID:', oid); // Debugging the raw route parameter

    if (!oid) {
      this.errorMessage = 'Route parameter "id" is missing or invalid.';
      return;
    }

    const orderId = Number(oid); // Convert to a number
    if (isNaN(orderId) || orderId <= 0) {
      this.errorMessage = 'Invalid order ID.';
      return;
    }

    this.orderService.getOrder(orderId).subscribe(
      (data: IOrder) => {
        this.order = data;
      },
      (error: any) => {
        this.errorMessage = 'Unable to fetch order data.';
      }
    );
  }

  updateOrder(): void {
    this.orderoidError = '';
    this.ordercidError = '';
    this.orderpidError = '';
    this.orderquantityError = '';
    this.successMessage = '';

    if (!this.order.oid) {
      this.orderoidError = 'Order ID is required.';
    }

    if (!this.order.cid) {
      this.ordercidError = 'Customer ID is required.';
    }
    
    if (!this.order.pid) {
      this.orderpidError = 'Product ID is required.';
    }

    if (!this.order.quantity) {
      this.orderquantityError = 'Order quantity is required.';
    }

    if (this.orderoidError || this.ordercidError || this.orderpidError || this.orderquantityError) {
      return; // Stop if there are validation errors
    }

    this.orderService.updateOrder(this.order.oid, this.order).subscribe(
      () => {
        this.errorMessage = '';
        this.successMessage = 'Order updated successfully. Redirecting...';

        // Set a delay before redirecting
        setTimeout(() => {
          // After the delay, navigate to the first page
          this.router.navigate(['/firstpage']);
        }, 1500);
      },
      (error: any) => {
        this.errorMessage = 'Failed to update the order. Please try again later.';
      }
    );
  }

  clearErrorMessage(): void {
    this.errorMessage = '';
  }
}
