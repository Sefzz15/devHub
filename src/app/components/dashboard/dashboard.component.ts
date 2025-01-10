import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { SessionService } from '../../../services/session.service';
import { ProductService } from '../../../services/product.service';
import { HttpClient } from '@angular/common/http';

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
    private http: HttpClient

  ) {

  }

  ngOnInit() {
    this.username = this._sessionService.username;
    this.userID = this._sessionService.userID;
    this.getProducts();

    console.log('Username in Dashboard:', this.username);
    console.log('UserID in Dashboard:', this.userID);


  }
  products: any[] = [];

  getProducts(): void {
    this.productService.getProducts().subscribe(
      (data: any) => {
        this.products = data.map((product: any) => ({
          ...product,
          quantity: 0, // Initialize quantity to 0
        }));
      },
      (error: any) => {
        console.error('Error fetching products:', error);
      }
    );
  }


  increaseQuantity(product: any) {
    product.quantity++;
  }

  decreaseQuantity(product: any) {
    if (product.quantity > 0) {
      product.quantity--;
    }
  }

  buyProducts() {
    const userID = this._sessionService.userID; // Get user ID from session service
    const selectedProducts = this.products
      .filter((product) => product.quantity > 0)
      .map((product) => ({
        productId: product.p_id,  // Correct field name
        quantity: product.quantity,
      }));

    const payload = {
      customerId: userID,  // Send customerId instead of userID
      products: selectedProducts,
    };

    // Log the payload to the console
    console.log("Generated JSON Payload:", JSON.stringify(payload, null, 2));

    this.http.post('https://localhost:5000/api/ComplexOrder', payload).subscribe({
      next: (response: any) => {
        console.log('Order created successfully:', response);
        this.getProducts();
      },
      error: (error) => {
        console.error('Error creating order:', error);
        alert('Failed to create order. Please try again.');
      },
    });
  }




  LogOut(): void {
    alert("You successfully logged out...");
    this._authService.logout();
    this._router.navigate(['/']);

  }
}
