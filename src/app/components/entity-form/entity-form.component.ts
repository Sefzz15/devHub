import { Component, Inject, OnInit, signal } from '@angular/core';
import { switchMap } from 'rxjs/operators';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UserService } from '../../../services/user.service';
import { ProductService } from '../../../services/product.service';
import { OrderService } from '../../../services/order.service';
import { TranslationService } from '../../../services/translation.service';
import { NotificationService } from '../../../services/notification.service';

export interface EntityFormData {
  type: 'user' | 'product' | 'order';
  id?: number;
}

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
  readonly errorMessage = signal('');

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: EntityFormData,
    private _dialogRef: MatDialogRef<EntityFormComponent, boolean>,
    private _userService: UserService,
    private _productService: ProductService,
    private _orderService: OrderService,
    private _i18n: TranslationService,
    private _notification: NotificationService
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

  visibleFields(): any[] {
    const fields = this.config()?.fields ?? [];
    return this.mode() === 'create'
      ? fields.filter((f: any) => !f.editOnly)
      : fields.filter((f: any) => !f.createOnly);
  }

  /** Localised "Create User" / "Update Product" form heading. */
  headerText(): string {
    return this._i18n.translate(
      this.mode() === 'create' ? 'entityForm.create' : 'entityForm.update',
      { entity: this.entityLabel() },
    );
  }

  ngOnInit(): void {
    const typeParam = this.data?.type;

    if (!typeParam) {
      this.errorMessage.set(this._i18n.translate('entityForm.invalidType'));
      return;
    }

    this.config.set(this.getConfig(typeParam));

    if (!this.config()) {
      this.errorMessage.set(this._i18n.translate('entityForm.unknownType', { type: typeParam }));
      return;
    }

    const id = this.data?.id;
    if (id !== undefined && id !== null) {
      this.mode.set('edit');
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
        idKey: 'uid',
        fields: [
          { key: 'uname', label: 'Username', required: true },
          // Changing a password goes through PUT {id}/password instead.
          { key: 'upass', label: 'Password', required: true, type: 'password', createOnly: true },
          // Optional on update: leaving both blank means "do not change it".
          { key: 'currentPassword', label: 'Current password', type: 'password', editOnly: true },
          { key: 'newPassword', label: 'New password', type: 'password', editOnly: true }
        ],
        create: (entity: any) => this._userService.createUser(entity),
        update: (id: number, entity: any) => this._userService.updateUser(id, entity),
        get: (id: number) => this._userService.getUser(id),
        /** Password change, when one was typed. */
        beforeUpdate: (id: number, entity: any) =>
          entity.newPassword
            ? this._userService.updatePassword(id, entity.currentPassword ?? '', entity.newPassword)
            : null,
        /** The two password fields are optional, but only as a pair. */
        extraValidate: (entity: any) => {
          const errors: { [key: string]: string } = {};
          const required = (key: string) =>
            this._i18n.translate('entityForm.required', {
              field: this._i18n.translate('field.' + key),
            });
          if (entity.newPassword && !entity.currentPassword) errors['currentPassword'] = required('currentPassword');
          if (entity.currentPassword && !entity.newPassword) errors['newPassword'] = required('newPassword');
          return errors;
        }
      },
      product: {
        title: 'Product',
        idKey: 'pid',
        fields: [
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
        idKey: 'oid',
        fields: [
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

    const id = this.entity[config.idKey];
    const save$ = this.mode() === 'create' ? config.create(this.entity) : config.update(id, this.entity);

    // Password first: it is the step that can fail, and failing after the
    // profile save would leave the edit half-applied.
    const pre$ = this.mode() === 'edit' ? config.beforeUpdate?.(id, this.entity) ?? null : null;
    const action$ = pre$ ? pre$.pipe(switchMap(() => save$)) : save$;

    action$.subscribe({
      next: () => this.handleSuccess(
        this._i18n.translate(this.mode() === 'create' ? 'entityForm.createdSuccess' : 'entityForm.updatedSuccess'),
      ),
      error: (err: any) => this.errorMessage.set(
        this._i18n.translate(err?.status === 401 ? 'entityForm.wrongPassword' : 'entityForm.saveFailed'),
      )
    });
  }


  validate(): boolean {
    let isValid = true;
    const errors: { [key: string]: string } = {};
    for (const field of this.visibleFields()) {
      if (field.required && !this.entity[field.key]) {
        errors[field.key] = this._i18n.translate('entityForm.required', {
          field: this._i18n.translate('field.' + field.key),
        });
        isValid = false;
      }
    }
    Object.assign(errors, this.config().extraValidate?.(this.entity) ?? {});

    this.errors.set(errors);
    return Object.keys(errors).length === 0;
  }

  handleSuccess(message: string) {
    this._notification.success(message);
    this._dialogRef.close(true);
  }
}
