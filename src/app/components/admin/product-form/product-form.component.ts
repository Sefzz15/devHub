import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../../../services/product.service';
import { IProduct } from '../../../../interfaces/IProduct';

@Component({
  standalone: false,
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.css', '../user-form/user-form.component.css']
})
export class ProductFormComponent implements OnInit {
  product: IProduct = { pid: 0, pname: '', price: 0, stock: 0 };
  productNameError: string = '';
  productPriceError: string = '';
  productStockError: string = '';
  successMessage = '';
  errorMessage = '';
  mode: 'create' | 'edit' = 'create';

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _productService: ProductService
  ) { }

  ngOnInit(): void {
    const idParam = this._route.snapshot.paramMap.get('id');
    if (idParam) {
      this.mode = 'edit';
      const id = Number(idParam);
      if (!isNaN(id) && id > 0) {
        this._productService.getProduct(id).subscribe({
          next: (data) => this.product = data,
          error: () => this.errorMessage = 'Unable to fetch product data.'
        });
      } else {
        this.errorMessage = 'Invalid product ID.';
      }
    }
  }

  onSubmit(): void {
    this._clearErrorMessages();
    if (!this.validateInputs()) return;

    if (this.mode === 'create') {
      this._productService.createProduct(this.product).subscribe({
        next: () => this.handleSuccess('Product created successfully.'),
        error: () => this.errorMessage = 'Failed to create Product.'
      });
    } else {
      this._productService.updateProduct(this.product.pid, this.product).subscribe({
        next: () => this.handleSuccess('Product updated successfully.'),
        error: () => this.errorMessage = 'Failed to update Product.'
      });
    }
  }

  private handleSuccess(message: string) {
    this.successMessage = message + ' Redirecting...';
    setTimeout(() => this._router.navigate(['/adminpage']), 1500);
  }

  private validateInputs(): boolean {
    let isValid = true;

    if (!this.product.pname) {
      this.productNameError = 'Product name is required.';
      isValid = false;
    }

    if (!this.product.price) {
      this.productPriceError = 'Product Price is required.';
      isValid = false;
    }

    if (!this.product.stock) {
      this.productStockError = 'Product Stock is required.';
      isValid = false;

    }
    return isValid;
  }

  private _clearErrorMessages(): void {
    this.productNameError = '';
    this.productPriceError = '';
    this.productStockError = '';
    this.successMessage = '';
  }
}
