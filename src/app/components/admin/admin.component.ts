import { Component, OnInit, signal } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { ProductService } from '../../../services/product.service';
import { OrderService } from '../../../services/order.service';
import { OrderDetailService } from '../../../services/orderDetail.service';
import { SessionService } from '../../../services/session.service';
import { ConfirmationService } from '../../../services/confirmation.service';
import { NotificationService } from '../../../services/notification.service';
import { IUser, IUserValuesResponse } from '../../../interfaces/IUser';
import { IProduct, IProductValuesResponse } from '../../../interfaces/IProduct';
import { IOrder, IOrderValuesResponse } from '../../../interfaces/IOrder';
import { IOrderDetailsValues } from '../../../interfaces/IOrderDetail';

@Component({
  standalone: false,
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})

export class AdminComponent implements OnInit {
  readonly userID = signal<number | undefined>(undefined);
  readonly users = signal<IUser[]>([]);
  readonly products = signal<IProduct[]>([]);
  readonly orders = signal<IOrder[]>([]);
  readonly orderDetails = signal<IOrderDetailsValues[]>([]);


  constructor(
    private _sessionService: SessionService,
    private _userService: UserService,
    private _productService: ProductService,
    private _orderService: OrderService,
    private _orderDetailService: OrderDetailService,
    private _confirmation: ConfirmationService,
    private _notification: NotificationService
  ) { }

  ngOnInit(): void {
    this.userID.set(this._sessionService.userID);
    console.log('UserID in admin:', this.userID());
  }

  getUsers(): void {
    this._userService.getUsers().subscribe({
      next: (data: IUserValuesResponse[]) => {
        this.users.set(data); // Ensure this updates the array
      },
      error: (error: any) => {
        console.error('Error fetching users:', error);
      },
    });
  }

  // Delete a user
  deleteUser(id: number): void {
    this._confirmation
      .confirm({ title: 'Delete user', message: 'Are you sure you want to delete this user?' })
      .subscribe(confirmed => {
        if (!confirmed) return;
        this._userService.deleteUser(id).subscribe({
          next: () => {
            this._notification.success('User deleted.');
            this.getUsers();  // Refresh the user list
          },
          error: () => this._notification.error('Failed to delete user.'),
        });
      });
  }

  // Delete a product
  deleteProduct(id: number): void {
    this._confirmation
      .confirm({ title: 'Delete product', message: 'Are you sure you want to delete this product?' })
      .subscribe(confirmed => {
        if (!confirmed) return;
        this._productService.deleteProduct(id).subscribe({
          next: () => {
            this._notification.success('Product deleted.');
            this.getProducts();  // Refresh the product list
          },
          error: () => this._notification.error('Failed to delete product.'),
        });
      });
  }

  // Delete an order
  deleteOrder(id: number): void {
    this._confirmation
      .confirm({ title: 'Delete order', message: 'Are you sure you want to delete this order?' })
      .subscribe(confirmed => {
        if (!confirmed) return;
        this._orderService.deleteOrder(id).subscribe({
          next: () => {
            this._notification.success('Order deleted.');
            this.getOrders();  // Refresh the orders list
          },
          error: () => this._notification.error('Failed to delete order.'),
        });
      });
  }

  // Fetch products after deletion
  getProducts(): void {
    this._productService.getProducts().subscribe({
      next: (data: IProductValuesResponse[]) => {
        this.products.set(data);
      },
      error: (error: any) => {
        console.error('Error fetching products:', error);
      },
    });
  }

  // Fetch orders after deletion
  getOrders(): void {
    this._orderService.getOrders().subscribe({
      next: (data: IOrderValuesResponse[]) => {
        this.orders.set(data);
      },
      error: (error: any) => {
        console.error('Error fetching orders:', error);
      },
    });
  }

  // Fetch orders after deletion
  getOrderDetails(): void {
    this._orderDetailService.getOrderDetails().subscribe({
      next: (data: IOrderDetailsValues[]) => {
        this.orderDetails.set(data);
      },
      error: (error: any) => {
        console.error('Error fetching orders:', error);
      },
    });
  }

}
