import { Component, Inject } from '@angular/core';
import {
  MatDialogModule,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';

export interface ConfirmDialogData {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  /** Colour of the confirm button. 'danger' (default) for destructive actions, 'primary' for neutral ones like logout. */
  confirmColor?: 'danger' | 'primary';
}

/**
 * Reusable confirmation dialog, opened via ConfirmationService.
 * Closes with `true` (confirmed) or `false` (cancelled / dismissed).
 * Styling mirrors the app's existing palette (brand #3e4684, danger #c23535).
 */
@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [MatDialogModule],
  template: `
    <h2 mat-dialog-title class="confirm-title">{{ data.title || 'Confirm' }}</h2>
    <mat-dialog-content class="confirm-message">{{ data.message }}</mat-dialog-content>
    <mat-dialog-actions class="confirm-actions">
      <button type="button" class="btn btn-cancel" [mat-dialog-close]="false">
        {{ data.cancelText || 'Cancel' }}
      </button>
      <button
        type="button"
        class="btn"
        [class.btn-primary]="data.confirmColor === 'primary'"
        [class.btn-danger]="data.confirmColor !== 'primary'"
        [mat-dialog-close]="true"
        cdkFocusInitial
      >
        {{ data.confirmText || 'Delete' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    :host {
      display: block;
      font-family: Roboto, "Helvetica Neue", sans-serif;
      color: #4d4d4d;
    }

    .confirm-title {
      font-weight: bold;
      color: #3e4684;
    }

    .confirm-message {
      color: #4d4d4d;
    }

    .confirm-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.75em;
      padding-top: 0.5em;
    }

    .btn {
      padding: 0.8em 1.2em;
      font-size: 1em;
      border-radius: 8px;
      font-weight: 600;
      border: none;
      cursor: pointer;
      transition: background-color 0.3s ease;
    }

    .btn-cancel {
      background-color: #e6e9f9;
      color: #3e4684;
    }

    .btn-cancel:hover {
      background-color: #d4d9f0;
    }

    .btn-danger {
      background-color: #c23535;
      color: white;
    }

    .btn-danger:hover {
      background-color: #b92e2e;
    }

    .btn-primary {
      background-color: #3e4684;
      color: white;
    }

    .btn-primary:hover {
      background-color: #2c3561;
    }
  `],
})
export class ConfirmDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData) {}
}
