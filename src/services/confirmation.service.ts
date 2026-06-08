import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '../app/components/confirm-dialog/confirm-dialog.component';

/**
 * Opens a reusable confirmation dialog, replacing blocking window.confirm() calls.
 * Emits `true` if the user confirms, `false` otherwise.
 */
@Injectable({ providedIn: 'root' })
export class ConfirmationService {
  constructor(private _dialog: MatDialog) {}

  confirm(data: ConfirmDialogData): Observable<boolean> {
    return this._dialog
      .open(ConfirmDialogComponent, {
        data,
        width: '420px',
        autoFocus: false,
        restoreFocus: true,
        panelClass: 'confirm-dialog-panel',
      })
      .afterClosed();
  }
}
