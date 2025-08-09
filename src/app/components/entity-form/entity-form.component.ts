import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { ProductService } from '../../../services/product.service';
import { OrderService } from '../../../services/order.service';

@Component({
  standalone: false,
  selector: 'app-entity-form',
  templateUrl: './entity-form.component.html',
  styleUrls: ['./entity-form.component.css', '../admin/user-form/user-form.component.css']
})
export class EntityFormComponent implements OnInit {
  entity: any = {};
  config: any;
  mode: 'create' | 'edit' = 'create';
  errors: { [key: string]: string } = {};
  successMessage = '';
  errorMessage = '';

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private userService: UserService,
    private productService: ProductService,
    private orderService: OrderService
  ) { }

  ngOnInit(): void {
    const type = this._route.snapshot.paramMap.get('type') || '';
    this.config = this.getConfig(type);

    const idParam = this._route.snapshot.paramMap.get('id');
    if (idParam) {
      this.mode = 'edit';
      const id = Number(idParam);
      if (!isNaN(id) && id > 0) {
        this.config.service.get(id).subscribe({
          next: (data: any) => this.entity = data,
          error: () => this.errorMessage = `Unable to fetch ${type} data.`
        });
      }
    }
  }

  getConfig(type: string) {
    const configs: any = {
      user: {
        title: 'User',
        fields: [
          { key: 'uid', label: 'User ID', readonly: true },
          { key: 'uname', label: 'Username', required: true },
          { key: 'upass', label: 'Password', required: true, type: 'password' }
        ],
        service: this.userService
      },
      product: {
        title: 'Product',
        fields: [
          { key: 'pid', label: 'Product ID', readonly: true },
          { key: 'pname', label: 'Product Name', required: true },
          { key: 'price', label: 'Price', required: true, type: 'number' },
          { key: 'stock', label: 'Stock Quantity', required: true, type: 'number' }
        ],
        service: this.productService
      },
      order: {
        title: 'Order',
        fields: [
          { key: 'oid', label: 'Order ID', readonly: true },
          { key: 'uid', label: 'User ID', required: true, type: 'number' },
          { key: 'date', label: 'Date', required: true, type: 'date' }
        ],
        service: this.orderService
      }
    };
    return configs[type];
  }


  onSubmit(): void {
    if (!this.validate()) return;
    const action$ = this.mode === 'create'
      ? this.config.service.create(this.entity)
      : this.config.service.update(this.entity[this.config.fields[0].key], this.entity);

    action$.subscribe({
      next: () => this.handleSuccess(`${this.mode === 'create' ? 'Created' : 'Updated'} successfully.`),
      error: () => this.errorMessage = `Failed to ${this.mode} ${this._route.snapshot.paramMap.get('type')}.`
    });
  }

  validate(): boolean {
    let isValid = true;
    this.errors = {};
    for (const field of this.config.fields) {
      if (field.required && !this.entity[field.key]) {
        this.errors[field.key] = `${field.label} is required.`;
        isValid = false;
      }
    }
    return isValid;
  }

  handleSuccess(message: string) {
    this.successMessage = message + ' Redirecting...';
    setTimeout(() => this._router.navigate(['/adminpage']), 1500);
  }
}
