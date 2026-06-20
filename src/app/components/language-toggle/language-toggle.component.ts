import { Component } from '@angular/core';
import { TranslationService } from '../../../services/translation.service';

/**
 * Circular flag button in the navbar that flips the whole UI between English
 * and Greek. Shows the flag of the language currently active; clicking switches
 * to the other one.
 */
@Component({
  standalone: false,
  selector: 'app-language-toggle',
  templateUrl: './language-toggle.component.html',
  styleUrls: ['./language-toggle.component.css'],
})
export class LanguageToggleComponent {
  constructor(public i18n: TranslationService) {}

  toggle(): void {
    this.i18n.toggle();
  }
}
