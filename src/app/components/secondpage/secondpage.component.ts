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
  cid: number = 0;

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
    this.checkIfUserIsCustomer();

    console.log('Username :', this.username);
    console.log('UserID :', this.userID);

  }

  products: any[] = [];
  productQuantities: Map<number, number> = new Map(); // Map to track product quantity changes

  getProducts(): void {
    this.productService.getProducts().subscribe(
      (data: any) => {
        console.log("Fetched products:", data);
        this.products = data.$values.map((product: any) => ({
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
    const currentQuantity = this.productQuantities.get(product.pid) || 0;
    this.productQuantities.set(product.pid, currentQuantity + 1);
    product.quantity++;
  }

  decreaseQuantity(product: any) {
    if (product.quantity > 0) {
      product.quantity--;
    }
    const currentQuantity = this.productQuantities.get(product.pid) || 0;
    if (currentQuantity > 0) {
      this.productQuantities.set(product.pid, currentQuantity - 1);
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

    const orderItems = Array.from(this.productQuantities)
    .filter(([pid, quantity]) => quantity > 0) // Only include items with quantity > 0
    .map(([pid, quantity]) => ({
      Pid: pid,
      Quantity: quantity
    }));

    console.log('Order Items:', orderItems);
    const payload = {

      "cid": this.cid,
      "date": "2024-01-30T12:00:00",
      "orderItems": orderItems

    };

    console.log('Payload to be sent:', JSON.stringify(payload, null, 2));

    this.http.post('https://localhost:5000/api/orders', payload).subscribe({
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

  checkIfUserIsCustomer() {
    this._authService.checkIfUserIsCustomer(this.userID).subscribe({
      next: (response) => {
        console.log('Customer data:', response);
        const customerData = response;
        this.cid = response.cid;
      },
      error: (error) => {
        console.error('Error:', error);
      }
    });
  }

  LogOut(): void {
    alert("You successfully logged out...");
    this._authService.logout();
    this._router.navigate(['/']);
  }
}
