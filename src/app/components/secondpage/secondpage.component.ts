import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { SessionService } from '../../../services/session.service';
import { ProductService } from '../../../services/product.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-secondpage',
  standalone: false,

  templateUrl: './secondpage.component.html',
  styleUrls: ['../firstpage/firstpage.component.css', './secondpage.component.css'],
})
export class SecondpageComponent {
  userID: number = 0;
  username: string = '';

  constructor(
    private _router: Router,
    private _authService: AuthService,
    private _sessionService: SessionService,
    private productService: ProductService,
    private http: HttpClient
  ) { }

  ngOnInit() {
    this.username = this._sessionService.username;
    this.userID = this._sessionService.userID;
    this.getProducts();

    console.log('Username :', this.username);
    console.log('UserID :', this.userID);
  }

  products: any[] = [];

  getProducts(): void {
    this.productService.getProducts().subscribe(
      (data: any) => {
        console.log("Fetched products:", data);
        this.products = data.map((product: any) => ({
          ...product,
          quantity: 0,
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

  validateNumber(event: KeyboardEvent): void {
    const allowedKeys = ['Backspace', 'ArrowLeft', 'ArrowRight', 'Delete', 'Tab'];
    if (
      !/^\d$/.test(event.key) &&
      !allowedKeys.includes(event.key)
    ) {
      event.preventDefault();
    }
  }

  buyProducts() {
    const userID = this._sessionService.userID;  // The UID of the user from the Session Service

    const selectedProducts = this.products
      .filter((product) => product.quantity > 0)
      .map((product) => ({
        ProductId: product.pid,
        Quantity: product.quantity,
      }));

    if (selectedProducts.length === 0) {
      alert('Please select at least one product to buy.');
      return;
    }

    // Creating Payload
    const payload = {
      orderRequest: {
        Uid: String(userID),
        Products: selectedProducts,
      },
    };

    console.log('Payload to be sent:', JSON.stringify(payload, null, 2));

    // HTTP Request
    this.http.post('https://localhost:5000/api/complexorder/create-order', payload).subscribe({
      next: (response: any) => {
        console.log('Order created successfully:', response);
        this.getProducts(); // Refresh products
      },
      error: (error) => {
        console.error('Error creating order:', error);
        if (error.error && error.error.errors) {
          console.log(`Validation errors: ${JSON.stringify(error.error.errors, null, 2)}`);
        } else {
          alert('Failed to create order. Please try again.');
        }
      },
    });
  }

  LogOut(): void {
    alert("You successfully logged out...");
    this._authService.logout();
    this._router.navigate(['/']);
  }
}
