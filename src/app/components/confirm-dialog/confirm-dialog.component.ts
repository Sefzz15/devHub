import { Component, Inject } from '@angular/core';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';

export interface ConfirmDialogData {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  /** Color of the confirm button. 'danger' (default) for destructive actions, 'primary' for neutral ones like logout. */
  confirmColor?: 'danger' | 'primary';
  /** When set, the dialog demands a password and closes with the typed value instead of `true`. */
  requirePassword?: boolean;
  /** Placeholder for the password field. */
  passwordLabel?: string;
}

/**
 * Reusable confirmation dialog, opened via ConfirmationService.
 * Closes with `true` (confirmed) or `false` (canceled / dismissed).
 * Styling mirrors the app's existing palette (brand #3e4684, danger #c23535).
 */
@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [MatDialogModule],
  template: `
    <h2 mat-dialog-title class="dlg-title">{{ data.title || 'Confirm' }}</h2>
    <mat-dialog-content class="dlg-message">
      {{ data.message }}
      @if (data.requirePassword) {
        <input
          type="password"
          class="dlg-input"
          autocomplete="current-password"
          [placeholder]="data.passwordLabel || 'Password'"
          (input)="password = $any($event.target).value"
          (keyup.enter)="submit()"
        />
      }
    </mat-dialog-content>
    <mat-dialog-actions class="dlg-actions">
      <button type="button" class="btn btn-cancel" [mat-dialog-close]="false">
        {{ data.cancelText || 'Cancel' }}
      </button>
      <button
        type="button"
        class="btn"
        [class.btn-primary]="data.confirmColor === 'primary'"
        [class.btn-danger]="data.confirmColor !== 'primary'"
        [disabled]="!canConfirm"
        [mat-dialog-close]="data.requirePassword ? password : true"
      >
        {{ data.confirmText || 'Delete' }}
      </button>
    </mat-dialog-actions>
  `,
  styleUrls: ['../shared/dialog.css'],
  // No label above it, so it needs its own spacing.
  styles: [`
    .dlg-input {
      margin-top: 1em;
    }
  `],

})
export class ConfirmDialogComponent {
  password = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData,
    private _dialogRef: MatDialogRef<ConfirmDialogComponent, boolean | string>,
  ) {}

  get canConfirm(): boolean {
    return !this.data.requirePassword || !!this.password;
  }

  submit(): void {
    if (!this.canConfirm) return;
    this._dialogRef.close(this.data.requirePassword ? this.password : true);
  }
}
