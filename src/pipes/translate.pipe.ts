import { Pipe, PipeTransform, inject } from '@angular/core';
import { TranslationService } from '../services/translation.service';

/**
 * `{{ 'some.key' | translate }}` — resolves a key for the active language.
 * Impure so it re-evaluates when the language signal flips; pass an object for
 * `{placeholder}` substitution, e.g. `'cinema.showing' | translate: { count }`.
 */
@Pipe({ name: 'translate', standalone: true, pure: false })
export class TranslatePipe implements PipeTransform {
  private readonly _translation = inject(TranslationService);

  transform(key: string, params?: Record<string, string | number>): string {
    return this._translation.translate(key, params);
  }
}
