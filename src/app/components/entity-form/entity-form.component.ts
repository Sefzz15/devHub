import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { ProductService } from '../../../services/product.service';
import { OrderService } from '../../../services/order.service';
import { TranslationService } from '../../../services/translation.service';

@Component({
  standalone: false,
  selector: 'app-entity-form',
  templateUrl: './entity-form.component.html',
  styleUrls: ['./entity-form.component.css']
})
export class EntityFormComponent implements OnInit {
  // Kept as a plain object: it's two-way bound via [(ngModel)] on dynamic field
  // keys, which a signal can't back cleanly. The rest of the state is signals.
  entity: any = {};
  readonly config = signal<any>(undefined);
  readonly mode = signal<'create' | 'edit'>('create');
  readonly errors = signal<{ [key: string]: string }>({});
  readonly successMessage = signal('');
  readonly errorMessage = signal('');

  constructor(
    private _route: ActivatedRoute,
    public _router: Router,
    private _userService: UserService,
    private _productService: ProductService,
    private _orderService: OrderService,
    private _i18n: TranslationService
  ) { }

  /** Translation key for the current entity, derived from its config title. */
  private _entityKey(): string {
    switch (this.config()?.title) {
      case 'User': return 'entity.user';
      case 'Product': return 'entity.product';
      case 'Order': return 'entity.order';
      default: return 'entity.entity';
    }
  }

  /** Localised entity name, e.g. "User" / "Χρήστης". */
  entityLabel(): string {
    return this._i18n.translate(this._entityKey());
  }

  /** Localised "Create User" / "Update Product" form heading. */
  headerText(): string {
    return this._i18n.translate(
      this.mode() === 'create' ? 'entityForm.create' : 'entityForm.update',
      { entity: this.entityLabel() },
    );
  }

  ngOnInit(): void {
    const typeParam = this._route.snapshot.paramMap.get('type');
    console.log('Type param:', typeParam);

    if (!typeParam) {
      this.errorMessage.set(this._i18n.translate('entityForm.invalidType'));
      return;
    }

    this.config.set(this.getConfig(typeParam));

    if (!this.config()) {
      this.errorMessage.set(this._i18n.translate('entityForm.unknownType', { type: typeParam }));
      return;
    }

    const idParam = this._route.snapshot.paramMap.get('id');
    if (idParam) {
      this.mode.set('edit');
      const id = Number(idParam);
      if (!isNaN(id) && id > 0) {
        this.config().get(id).subscribe({
          next: (data: any) => (this.entity = data),
          error: () => this.errorMessage.set(this._i18n.translate('entityForm.fetchFailed', { entity: this.entityLabel() }))
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
        create: (entity: any) => this._userService.createUser(entity),
        update: (id: number, entity: any) => this._userService.updateUser(id, entity),
        get: (id: number) => this._userService.getUser(id)
      },
      product: {
        title: 'Product',
        fields: [
          { key: 'pid', label: 'Product ID', readonly: true },
          { key: 'pname', label: 'Product Name', required: true },
          { key: 'price', label: 'Price', required: true, type: 'number' },
          { key: 'stock', label: 'Stock Quantity', required: true, type: 'number' }
        ],
        create: (entity: any) => this._productService.createProduct(entity),
        update: (id: number, entity: any) => this._productService.updateProduct(id, entity),
        get: (id: number) => this._productService.getProduct(id)
      },
      order: {
        title: 'Order',
        fields: [
          { key: 'oid', label: 'Order ID', readonly: true },
          { key: 'uid', label: 'User ID', required: true, type: 'number' },
          { key: 'date', label: 'Date', required: true, type: 'datetime-local' }
        ],
        create: (entity: any) => this._orderService.createOrder(entity),
        update: (id: number, entity: any) => this._orderService.updateOrder(id, entity),
        get: (id: number) => this._orderService.getOrder(id)
      }

    };
    return configs[type];
  }

  onSubmit(): void {
    const config = this.config();
    if (!config) {
      this.errorMessage.set(this._i18n.translate('entityForm.invalidConfig'));
      return;
    }

    if (!this.validate()) return;

    if (config.title === 'Order') {
      if (!this.entity.date) {
        const now = new Date();
        const pad = (n: number) => n.toString().padStart(2, '0');
        this.entity.date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
      }
    }

    const action$ =
      this.mode() === 'create'
        ? config.create(this.entity)
        : config.update(this.entity[config.fields[0].key], this.entity);

    action$.subscribe({
      next: () => this.handleSuccess(
        this._i18n.translate(this.mode() === 'create' ? 'entityForm.createdSuccess' : 'entityForm.updatedSuccess'),
      ),
      error: () => this.errorMessage.set(this._i18n.translate('entityForm.saveFailed'))
    });
  }


  validate(): boolean {
    let isValid = true;
    const errors: { [key: string]: string } = {};
    for (const field of this.config().fields) {
      if (field.required && !this.entity[field.key]) {
        errors[field.key] = this._i18n.translate('entityForm.required', {
          field: this._i18n.translate('field.' + field.key),
        });
        isValid = false;
      }
    }
    this.errors.set(errors);
    return isValid;
  }

  handleSuccess(message: string) {
    this.successMessage.set(this._i18n.translate('entityForm.redirecting', { message }));
    setTimeout(() => this._router.navigate(['/admin']), 1500);
  }
}
