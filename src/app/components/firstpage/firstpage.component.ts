import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { ProductService } from '../../../services/product.service';
import { OrderService } from '../../../services/order.service';
import { SessionService } from '../../../services/session.service';
import { IUser } from '../../../interfaces/IUser';
import { IProduct } from '../../../interfaces/IProduct';
import { IOrder } from '../../../interfaces/IOrder';

@Component({
  standalone: false,
  selector: 'app-firstpage',
  templateUrl: './firstpage.component.html',
  styleUrl: './firstpage.component.css'
})

export class FirstpageComponent implements OnInit {
  userID?: number;
  users: IUser[] = [];
  products: IProduct[] = [];
  orders: IOrder[] = [];


  constructor(
    private _sessionService: SessionService,
    private userService: UserService,
    private productService: ProductService,
    private orderService: OrderService
  ) { }

  ngOnInit(): void {
    this.userID = this._sessionService.userID;
    console.log('UserID in firstpage:', this.userID);

  }

  getUsers(): void {
    this.userService.getUsers().subscribe(
      (data: any) => {
        this.users = data.$values; // Ensure this updates the array
      },
      (error: any) => {
        console.error('Error fetching users:', error);
      }
    );
  }

  // Delete a user
  deleteUser(id: number): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this.userService.deleteUser(id).subscribe(() => {
        this.getUsers();  // Refresh the user list
      });
    }
  }

  // Utility function to get product by ID
  getProductById(pid: number): any {
    return this.products.find(product => product.pid === pid) || null;
  }

  // Delete a product
  deleteProduct(id: number): void {
    if (confirm('Are you sure you want to delete this product?')) {
      this.productService.deleteProduct(id).subscribe(() => {
        this.getProducts();  // Refresh the product list
      });
    }
  }

  // Delete an order
  deleteOrder(id: number): void {
    if (confirm('Are you sure you want to delete this order?')) {
      this.orderService.deleteOrder(id).subscribe(() => {
        this.getOrders();  // Refresh the orders list
      });
    }
  }


  // Fetch products after deletion
  getProducts(): void {
    this.productService.getProducts().subscribe(
      (data: any) => {
        this.products = data.$values;
      },
      (error: any) => {
        console.error('Error fetching products:', error);
      }
    );
  }

  // Fetch orders after deletion
  getOrders(): void {
    this.orderService.getOrders().subscribe(
      (data: any) => {
        this.orders = data.$values;
      },
      (error: any) => {
        console.error('Error fetching orders:', error);
      }
    );
  }


}
