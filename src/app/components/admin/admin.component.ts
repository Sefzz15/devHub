import { TranslatePipe } from '../../../pipes/translate.pipe';
import { Component, OnInit, signal, inject } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { ProductService } from '../../../services/product.service';
import { OrderService } from '../../../services/order.service';
import { OrderDetailService } from '../../../services/orderDetail.service';
import { SessionService } from '../../../services/session.service';
import { ConfirmationService } from '../../../services/confirmation.service';
import { EntityFormService } from '../../../services/entity-form.service';
import { NotificationService } from '../../../services/notification.service';
import { TranslationService } from '../../../services/translation.service';
import { IUser, IUserValuesResponse } from '../../../interfaces/IUser';
import { IProduct, IProductValuesResponse } from '../../../interfaces/IProduct';
import { IOrder, IOrderValuesResponse } from '../../../interfaces/IOrder';
import { IOrderDetailsValues } from '../../../interfaces/IOrderDetail';

@Component({
  standalone: true,
  imports: [TranslatePipe],
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


  private readonly _sessionService = inject(SessionService);
  private readonly _userService = inject(UserService);
  private readonly _productService = inject(ProductService);
  private readonly _orderService = inject(OrderService);
  private readonly _orderDetailService = inject(OrderDetailService);
  private readonly _confirmation = inject(ConfirmationService);
  private readonly _entityForm = inject(EntityFormService);
  private readonly _notification = inject(NotificationService);
  private readonly _translation = inject(TranslationService);

  ngOnInit(): void {
    this.userID.set(this._sessionService.userID);
    console.log('UserID in admin:', this.userID());
  }

  /** Open the create/update dialog, refreshing that list if it saved. */
  openForm(type: 'user' | 'product' | 'order', id?: number): void {
    this._entityForm.open(type, id).subscribe(saved => {
      if (!saved) return;
      if (type === 'user') this.getUsers();
      else if (type === 'product') this.getProducts();
      else this.getOrders();
    });
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
      .confirmWithPassword({
        title: this._translation.translate('admin.deleteUserTitle'),
        message: this._translation.translate('admin.deleteUserMsg'),
        passwordLabel: this._translation.translate('admin.deleteUserPassword'),
        confirmText: this._translation.translate('common.delete'),
        cancelText: this._translation.translate('common.cancel'),
      })
      .subscribe(password => {
        if (!password) return;
        this._userService.deleteUser(id, password).subscribe({
          next: () => {
            this._notification.success(this._translation.translate('admin.userDeleted'));
            this.getUsers();  // Refresh the user list
          },
          error: (err: any) =>
            this._notification.error(
              this._translation.translate(
                err?.status === 401 ? 'admin.userDeleteWrongPassword' : 'admin.userDeleteFailed',
              ),
            ),
        });
      });
  }

  // Delete a product
  deleteProduct(id: number): void {
    this._confirmation
      .confirm({
        title: this._translation.translate('admin.deleteProductTitle'),
        message: this._translation.translate('admin.deleteProductMsg'),
        confirmText: this._translation.translate('common.delete'),
        cancelText: this._translation.translate('common.cancel'),
      })
      .subscribe(confirmed => {
        if (!confirmed) return;
        this._productService.deleteProduct(id).subscribe({
          next: () => {
            this._notification.success(this._translation.translate('admin.productDeleted'));
            this.getProducts();  // Refresh the product list
          },
          error: () => this._notification.error(this._translation.translate('admin.productDeleteFailed')),
        });
      });
  }

  // Delete an order
  deleteOrder(id: number): void {
    this._confirmation
      .confirm({
        title: this._translation.translate('admin.deleteOrderTitle'),
        message: this._translation.translate('admin.deleteOrderMsg'),
        confirmText: this._translation.translate('common.delete'),
        cancelText: this._translation.translate('common.cancel'),
      })
      .subscribe(confirmed => {
        if (!confirmed) return;
        this._orderService.deleteOrder(id).subscribe({
          next: () => {
            this._notification.success(this._translation.translate('admin.orderDeleted'));
            this.getOrders();  // Refresh the orders list
          },
          error: () => this._notification.error(this._translation.translate('admin.orderDeleteFailed')),
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
