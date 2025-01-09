import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { SessionService } from '../../../services/session.service';

@Component({
  selector: 'app-dashboard',
  standalone: false,

  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  userID: number = 0;
  username: string = '';

  constructor(private _router: Router, private _authService: AuthService, private _sessionService: SessionService) {

  }

  ngOnInit() {
    this.username = this._sessionService.username;
    this.userID = this._sessionService.userID;

    console.log('Username in Dashboard:', this.username);
    console.log('UserID in Dashboard:', this.userID);


  }
  products = [
    { product_id: 1, name: 'Product 1', quantity: 0 },
    { product_id: 2, name: 'Product 2', quantity: 0 },
    { product_id: 3, name: 'Product 3', quantity: 0 },
    { product_id: 4, name: 'Product 4', quantity: 0 },
  ];

  increaseQuantity(product: any) {
    product.quantity++;
  }

  decreaseQuantity(product: any) {
    if (product.quantity > 0) {
      product.quantity--;
    }
  }

  buyProducts() {
    const userID = this._sessionService.userID; // Παίρνουμε το userID από το SessionService
    const selectedProducts = this.products
      .filter((product) => product.quantity > 0)
      .map((product) => ({
        product_id: product.product_id,
        quantity: product.quantity,
      }));

    const result = `${userID},'[\n` +
      selectedProducts.map(product =>
        `  {"product_id": ${product.product_id}, "quantity": ${product.quantity}}`
      ).join(',\n') +
      `\n]`;

    console.log('Selected Products:', result);
  }



  LogOut(): void {
    alert("You successfully logged out...");
    this._authService.logout();
    this._router.navigate(['/']);

  }
}
