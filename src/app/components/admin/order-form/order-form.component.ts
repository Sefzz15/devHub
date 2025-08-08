import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IOrder } from '../../../../interfaces/IOrder';
import { OrderService } from '../../../../services/order.service';

@Component({
  standalone: false,
  selector: 'app-order-form',
  templateUrl: './order-form.component.html',
  styleUrls: ['./order-form.component.css']
})
export class OrderFormComponent implements OnInit {
  order: IOrder = { oid: 0, uid: 0, date: '' };
  orderoidError: string = '';
  orderuidError: string = '';
  orderdateError: string = '';
  successMessage: string = '';
  errorMessage: string = '';
  generalError: string = '';
  mode: 'create' | 'edit' = 'create';

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _orderService: OrderService
  ) { }

  ngOnInit(): void {
    const idParam = this._route.snapshot.paramMap.get('id');
    if (idParam) {
      this.mode = 'edit';
      const id = Number(idParam);
      if (!isNaN(id) && id > 0) {
        this._orderService.getOrder(id).subscribe({
          next: (data) => this.order = data,
          error: () => this.errorMessage = 'Unable to fetch order data.'
        });
      } else {
        this.errorMessage = 'Invalid order ID.';
      }
    }
  }

  onSubmit(): void {
    this.clearErrorMessages();
    if (!this.validateInputs()) return;

    if (this.mode === 'create') {
      this._orderService.createOrder(this.order).subscribe({
        next: () => this.handleSuccess('Order created successfully.',),
        error: () => this.errorMessage = 'Failed to create Order.'
      });
    } else {
      if (typeof this.order.date === 'string') {
        const parsed = new Date(this.order.date);
        if (!isNaN(parsed.getTime())) {
          this.order.date = parsed.toISOString();  // convert to valid format
        } else {
          this.errorMessage = 'Invalid date format.';
          return;
        }
      }

      this._orderService.updateOrder(this.order.oid, this.order).subscribe({
        next: () => this.handleSuccess('Order updated successfully.'),
        error: () => this.errorMessage = 'Failed to update Order.'
      });
    }
  }

  private handleSuccess(message: string) {
    this.successMessage = message + ' Redirecting...';
    setTimeout(() => this._router.navigate(['/adminpage']), 1500);
  }

  private validateInputs(): boolean {
    let isValid = true;
    if (!this.order.uid) {
      this.orderuidError = 'Order ID is required.';
      isValid = false;
    }
    if (!this.order.date) {
      this.orderdateError = 'Order Date ID is required.';
      isValid = false;
    }
    return isValid;
  }

  private clearErrorMessages(): void {
    this.orderoidError = '';
    this.orderuidError = '';
    this.orderdateError = '';
    this.successMessage = '';
  }
}
