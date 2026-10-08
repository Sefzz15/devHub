import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import {
  EntityFormComponent,
  EntityFormData,
} from '../app/components/entity-form/entity-form.component';

/** Emits `true` when something was saved, `undefined` when canceled. */
@Injectable({ providedIn: 'root' })
export class EntityFormService {
  constructor(private _dialog: MatDialog) {}

  open(type: EntityFormData['type'], id?: number): Observable<boolean | undefined> {
    return this._dialog
      .open(EntityFormComponent, {
        data: { type, id } satisfies EntityFormData,
        width: '420px',
        autoFocus: 'first-tabbable',
        restoreFocus: true,
        panelClass: 'confirm-dialog-panel',
      })
      .afterClosed();
  }
}
