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
  product = { pid: 0, p_name: '', description: '', price: '', stock: '' };
  productnameError: string = '';
  productpriceError: string = '';
  productquantityError: string = '';
  successMessage: string = '';
  errorMessage: string = '';
  generalError: string = '';

  constructor(private productService: ProductService, private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    const pid = this.route.snapshot.paramMap.get('id');
    console.log('Route ID:', pid); // Debugging the raw route parameter

    if (!pid) {
      this.errorMessage = 'Route parameter "id" is missing or invalid.';
      return;
    }

    const productId = Number(pid); // Convert to a number
    if (isNaN(productId) || productId <= 0) {
      this.errorMessage = 'Invalid product ID.';
      return;
    }

    this.productService.getProduct(productId).subscribe(
      (data: any) => {
        this.product = data;
      },
      (error: any) => {
        this.errorMessage = 'Unable to fetch product data.';
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

    if (!this.product.stock) {
      this.productquantityError = 'Stock quantity is required.';
    }

    if (this.productnameError || this.productnameError) {
      return; // Stop if there are validation errors
    }

    this.productService.updateProduct(this.product.pid, this.product).subscribe(
      () => {
        this.errorMessage = '';
        this.successMessage = 'Product updated successfully. Redirecting...';

        // Set a delay before redirecting
        setTimeout(() => {
          // After the delay, navigate to the first page
          this.router.navigate(['/firstpage']);
        }, 1500);
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
