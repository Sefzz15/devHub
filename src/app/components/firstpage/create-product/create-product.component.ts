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
  product = { pname: '', description: '', price: '', stock: '' };
  productnameError: string = '';
  productpriceError: string = '';
  productquantityError: string = '';
  successMessage: string = '';
  errorMessage: string = '';
  generalError: string = '';

  constructor(private productService: ProductService, private router: Router) { }

  ngOnInit(): void {
  }

  createProduct(): void {
    this.clearErrorMessages();

    if (!this.validateInputs()) {
      return; // If validation fails, stop the form submission
    }

    // Call the service to create the product
    this.productService.createProduct(this.product).subscribe(
      (response: any) => {
        this.errorMessage = '';
        this.successMessage = 'Product created successfully. Redirecting...';

        // Set a delay before redirecting
        setTimeout(() => {
          // After 1,5 seconds, navigate to the first page
          this.router.navigate(['/firstpage']);
        }, 1500);
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

    if (!this.product.pname) {
      this.productnameError = 'Product name is required.';
      isValid = false;
    }

    if (!this.product.price) {
      this.productpriceError = 'Price is required.';
      isValid = false;
    }

    if (!this.product.stock) {
      this.productquantityError = 'Stock Quantity is required.';
      isValid = false;
    }

    return isValid;
  }
}
