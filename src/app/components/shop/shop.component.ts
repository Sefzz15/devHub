import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { SessionService } from '../../../services/session.service';
import { ProductService } from '../../../services/product.service';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { IProductValuesResponse } from '../../../interfaces/IProduct';

@Component({
  selector: 'app-shop',
  standalone: false,

  templateUrl: './shop.component.html',
  styleUrls: [
    '../admin/admin.component.css',
    './shop.component.css'],
})
export class ShoppageComponent {
  userID: number = 0;
  username: string = '';
  uid: number = 0;

  constructor(
    private _router: Router,
    private _authService: AuthService,
    private _sessionService: SessionService,
    private _productService: ProductService,
    private _http: HttpClient
  ) { }

  ngOnInit() {
    this.username = this._sessionService.username;
    this.userID = this._sessionService.userID;
    this.getProducts();

    console.log('Username :', this.username);
    console.log('UserID :', this.userID);

  }

  products: any[] = [];
  productQuantities: Map<number, number> = new Map(); // Map to track product quantity changes

  getProducts(): void {
    this._productService.getProducts().subscribe(
      (data: IProductValuesResponse[]) => {
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

  onQuantityChange(product: any): void {
    const quantity = Number(product.quantity);
    if (quantity >= 0) {
      this.productQuantities.set(product.pid, quantity);
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

    const orderDetails = Array.from(this.productQuantities)
      .filter(([pid, quantity]) => quantity > 0) // Only include items with quantity > 0
      .map(([pid, quantity]) => ({
        pid: pid,
        quantity: quantity
      }));

    console.log('Order details:', orderDetails);
    const payload = {

      "uid": this._sessionService.userID,
      "orderDetails": orderDetails

    };

    console.log('Payload to be sent:', JSON.stringify(payload, null, 2));

    this._http.post('https://localhost:5000/api/orders/create', payload).subscribe({
      next: (response: any) => {
        console.log('Order created successfully:', response);
        this.productQuantities.clear();
        this.getProducts();
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error response from backend:', error);

        const message =
          typeof error.error === 'string'
            ? error.error
            : error.error?.message || 'An unexpected error occurred.';

        alert(message);
      }
    });
  }

  LogOut(): void {
    alert("You successfully logged out...");
    this._authService.logout();
    this._router.navigate(['/']);
  }
}
