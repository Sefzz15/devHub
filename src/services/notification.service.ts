import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

export type NotificationType = 'success' | 'error' | 'info' | 'warn';

/**
 * App-wide toast notifications, replacing blocking window.alert() calls.
 * Wraps Angular Material's MatSnackBar so every message looks and behaves
 * consistently. Colour is applied via the `notification--<type>` panel class
 * (see global styles in styles.css).
 */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  constructor(private _snackBar: MatSnackBar) {}

  /** Confirmation of a completed action (short-lived). */
  success(message: string, durationMs = 3000): void {
    this._show(message, 'success', durationMs);
  }

  /** A failure the user needs to notice; stays longer. */
  error(message: string, durationMs = 6000): void {
    this._show(message, 'error', durationMs);
  }

  /** Neutral information. */
  info(message: string, durationMs = 4000): void {
    this._show(message, 'info', durationMs);
  }

  /** A caution / something the user should be aware of. */
  warn(message: string, durationMs = 4000): void {
    this._show(message, 'warn', durationMs);
  }

  private _show(message: string, type: NotificationType, durationMs: number): void {
    const config: MatSnackBarConfig = {
      duration: durationMs,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: [`notification--${type}`],
    };
    this._snackBar.open(message, 'Dismiss', config);
  }
}
