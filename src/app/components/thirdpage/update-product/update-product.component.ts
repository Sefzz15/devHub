import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../../../services/product.service';

@Component({
  standalone: false,
  selector: 'app-update-product',
  templateUrl: './update-product.component.html',
  styleUrls: ['../../firstpage/create-user/create-user.component.css'],
})
export class UpdateProductComponent implements OnInit {
  product = { p_id: 0, p_name: '', description: '', price: '', stock_quantity: '' };
  productnameError: string = '';
  productpriceError: string = '';
  productquantityError: string = '';
  successMessage: string = '';
  errorMessage: string = '';
  generalError: string = '';

  constructor(private productService: ProductService, private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    const p_id = this.route.snapshot.paramMap.get('id');
    console.log('Route ID:', p_id); // Debugging the raw route parameter

    if (!p_id) {
      this.errorMessage = 'Route parameter "id" is missing or invalid.';
      return;
    }

    const productId = Number(p_id); // Convert to a number
    if (isNaN(productId) || productId <= 0) {
      this.errorMessage = 'Invalid product ID.';
      return;
    }

    this.productService.getProduct(productId).subscribe(
      (data: any) => {
        this.product = data;
      },
      (error: any) => {
        this.errorMessage = 'Unable to fetch product details.';
      }
    );
  }

  updateProduct(): void {
    this.productnameError = '';
    this.productpriceError = '';
    this.productquantityError = '';
    this.successMessage = '';

    if (!this.product.p_name) {
      this.productnameError = 'Productname is required.';
    }

    if (!this.product.price) {
      this.productpriceError = 'Password is required.';
    }

    if (!this.product.stock_quantity) {
      this.productquantityError = 'Stock quantity is required.';
    }

    if (this.productnameError || this.productnameError) {
      return; // Stop if there are validation errors
    }

    this.productService.updateProduct(this.product.p_id, this.product).subscribe(
      () => {
        // Show success message
        this.errorMessage = '';
        this.successMessage = 'Product updated successfully. Redirecting...';

        // Set a delay before redirecting
        setTimeout(() => {
          // After the delay, navigate to the third page
          this.router.navigate(['/thirdpage']);
        }, 2000); // 2-second delay (2000ms)
      },
      (error: any) => {
        this.errorMessage = 'Failed to update the product. Please try again later.';
      }
    );
  }

  clearErrorMessage(): void {
    this.errorMessage = '';
  }
}
