import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { ProductService } from '../../../services/product.service';
import { OrderService } from '../../../services/order.service';
import { OrderDetailService } from '../../../services/orderDetail.service';
import { SessionService } from '../../../services/session.service';
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
  userID?: number;
  users: IUser[] = [];
  products: IProduct[] = [];
  orders: IOrder[] = [];
  orderDetails: IOrderDetailsValues[] = [];


  constructor(
    private _sessionService: SessionService,
    private _userService: UserService,
    private _productService: ProductService,
    private _orderService: OrderService,
    private _orderDetailService: OrderDetailService
  ) { }

  ngOnInit(): void {
    this.userID = this._sessionService.userID;
    console.log('UserID in admin:', this.userID);
  }

  getUsers(): void {
    this._userService.getUsers().subscribe(
      (data: IUserValuesResponse[]) => {
        this.users = data; // Ensure this updates the array
      },
      (error: any) => {
        console.error('Error fetching users:', error);
      }
    );
  }

  // Delete a user
  deleteUser(id: number): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this._userService.deleteUser(id).subscribe(() => {
        this.getUsers();  // Refresh the user list
      });
    }
  }

  // Delete a product
  deleteProduct(id: number): void {
    if (confirm('Are you sure you want to delete this product?')) {
      this._productService.deleteProduct(id).subscribe(() => {
        this.getProducts();  // Refresh the product list
      });
    }
  }

  // Delete an order
  deleteOrder(id: number): void {
    if (confirm('Are you sure you want to delete this order?')) {
      this._orderService.deleteOrder(id).subscribe(() => {
        this.getOrders();  // Refresh the orders list
      });
    }
  }

  // Fetch products after deletion
  getProducts(): void {
    this._productService.getProducts().subscribe(
      (data: IProductValuesResponse[]) => {
        this.products = data;
      },
      (error: any) => {
        console.error('Error fetching products:', error);
      }
    );
  }

  // Fetch orders after deletion
  getOrders(): void {
    this._orderService.getOrders().subscribe(
      (data: IOrderValuesResponse[]) => {
        this.orders = data;
      },
      (error: any) => {
        console.error('Error fetching orders:', error);
      }
    );
  }

  // Fetch orders after deletion
  getOrderDetails(): void {
    this._orderDetailService.getOrderDetails().subscribe(
      (data: IOrderDetailsValues[]) => {
        this.orderDetails = data;
      },
      (error: any) => {
        console.error('Error fetching orders:', error);
      }
    );
  }

}
