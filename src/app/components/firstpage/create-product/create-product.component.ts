import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService } from '../../../../services/product.service';

@Component({
  standalone: false,
  selector: 'app-create-product',
  templateUrl: './create-product.component.html',
  styleUrls: ['../../firstpage/create-user/create-user.component.css'],
})
export class CreateProductComponent implements OnInit {
  product = { p_name: '', description: '', price: '', stock_quantity: '' };
  productnameError: string = '';
  productpriceError: string = '';
  productquantityError: string = '';
  successMessage: string = '';
  errorMessage: string = '';
  generalError: string = '';

  constructor(private productService: ProductService, private router: Router) { }

  ngOnInit(): void {
    // Initialization logic (if needed)
  }

  createProduct(): void {
    // Clear previous error messages
    this.clearErrorMessages();

    // Validate product inputs
    if (!this.validateInputs()) {
      return; // If validation fails, stop the form submission
    }

    // Call the service to create the product
    this.productService.createProduct(this.product).subscribe(
      (response: any) => {
        // Show success message
        this.errorMessage = '';
        this.successMessage = 'Product created successfully. Redirecting...';

        // Set a delay before redirecting
        setTimeout(() => {
          // After 2 seconds, navigate to the first page
          this.router.navigate(['/firstpage']);
        }, 2000); // Adjust the delay time here (2000ms = 2 seconds)
      },
      (error: any) => {
        this.errorMessage = 'Failed to create the product. Please try again later.';
      }
    );
  }

  clearErrorMessages(): void {
    this.productnameError = '';
    this.productpriceError = '';
    this.productquantityError = '';
    this.successMessage = '';
  }

  validateInputs(): boolean {
    let isValid = true;

    // Product name validation
    if (!this.product.p_name) {
      this.productnameError = 'Product name is required.';
      isValid = false;
    }

    // Product price validation
    if (!this.product.price) {
      this.productpriceError = 'Price is required.';
      isValid = false;
    }

    // Product stock_quantity validation
    if (!this.product.stock_quantity) {
      this.productquantityError = 'Stock Quantity is required.';
      isValid = false;
    }

    return isValid;
  }
}
