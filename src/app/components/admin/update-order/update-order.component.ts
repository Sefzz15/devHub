import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService } from '../../../../services/order.service';
import { IOrder } from '../../../../interfaces/IOrder';

@Component({
  standalone: false,
  selector: 'app-update-order',
  templateUrl: './update-order.component.html',
  styleUrls: ['../../admin/create-user/create-user.component.css'],
})
export class UpdateOrderComponent implements OnInit {
  order = { oid: 0, uid: 0, date: '' };

  orderoidError: string = '';
  orderuidError: string = '';
  orderdateError: string = '';
  successMessage: string = '';
  errorMessage: string = '';
  generalError: string = '';

  constructor(
    private _orderService: OrderService,
    private _route: ActivatedRoute,
    private _router: Router
  ) { }

  ngOnInit(): void {
    const oid = this._route.snapshot.paramMap.get('id');
    const uid = this._route.snapshot.paramMap.get('id');
    console.log('Route ID:', oid); // Debugging the raw route parameter

    if (!oid) {
      this.errorMessage = 'Route parameter "id" is missing or invalid.';
      return;
    }

    if (!uid) {
      this.errorMessage = 'Route parameter "uid" is missing or invalid.';
      return;
    }

    const orderId = Number(oid); // Convert to a number
    if (isNaN(orderId) || orderId <= 0) {
      this.errorMessage = 'Invalid order ID.';
      return;
    }

    this._orderService.getOrder(orderId).subscribe(
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
    this.successMessage = '';

    if (!this.order.oid) {
      this.orderoidError = 'Order ID is required.';
    }




    this._orderService.updateOrder(this.order.oid, this.order).subscribe(
      () => {
        this.errorMessage = '';
        this.successMessage = 'Order updated successfully. Redirecting...';

        // Set a delay before redirecting
        setTimeout(() => {
          // After the delay, navigate to the admin page
          this._router.navigate(['/adminpage']);
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
