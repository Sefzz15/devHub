import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { SessionService } from '../../../services/session.service';
import { ProductService } from '../../../services/product.service';
import { HttpClient } from '@angular/common/http';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-dashboard',
  standalone: false,

  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  userID: number = 0;
  username: string = '';

  constructor(
    private _router: Router,
    private _authService: AuthService,
    private _sessionService: SessionService,
    private productService: ProductService,
    private http: HttpClient,
    private userService: UserService
  ) { }

  ngOnInit() {
    this.username = this._sessionService.username;
    this.userID = this._sessionService.userID;

    console.log('Username in Dashboard:', this.username);
    console.log('UserID in Dashboard:', this.userID);

  }

  // products: any[] = [];

  // getProducts(): void {
  //   this.productService.getProducts().subscribe(
  //     (data: any) => {
  //       console.log("Fetched products:", data);
  //       this.products = data.map((product: any) => ({
  //         ...product,
  //         quantity: 0, // Initialize quantity to 0
  //       }));
  //     },
  //     (error: any) => {
  //       console.error('Error fetching products:', error);
  //     }
  //   );
  // }


  // increaseQuantity(product: any) {
  //   product.quantity++;
  // }

  // decreaseQuantity(product: any) {
  //   if (product.quantity > 0) {
  //     product.quantity--;
  //   }
  // }
  // validateNumber(event: KeyboardEvent): void {
  //   const allowedKeys = ['Backspace', 'ArrowLeft', 'ArrowRight', 'Delete', 'Tab'];
  //   if (
  //     !/^\d$/.test(event.key) &&
  //     !allowedKeys.includes(event.key)
  //   ) {
  //     event.preventDefault();
  //   }
  // }

  // buyProducts() {
  //   const userID = this._sessionService.userID;  // Get user ID from session service

  //   // Filter products where quantity is greater than 0 (not stock quantity)
  //   const selectedProducts = this.products
  //     .filter((product) => product.quantity > 0)
  //     .map((product) => ({
  //       pid: product.pid,
  //       quantity: product.quantity,
  //     }));

  //   // If no products were selected, alert the user
  //   if (selectedProducts.length === 0) {
  //     alert('Please select at least one product to buy.');
  //     return;
  //   }

  //   const payload = {
  //     customerId: userID, 
  //     products: selectedProducts,
  //   };

  //   console.log("Payload to be sent:", JSON.stringify(payload, null, 2));  // Log the payload for debugging

  //   // Make the HTTP request to create the order
  //   this.http.post('https://localhost:5000/api/ComplexOrder', payload).subscribe({
  //     next: (response: any) => {
  //       console.log('Order created successfully:', response);
  //       this.getProducts();  // Refresh the product list after the order
  //     },
  //     error: (error) => {
  //       console.error('Error creating order:', error);
  //       alert('Failed to create order. Please try again.');
  //     },
  //   });
  // }

  LogOut(): void {
    alert("You successfully logged out...");
    this._authService.logout();
    this._router.navigate(['/']);

  }
}
