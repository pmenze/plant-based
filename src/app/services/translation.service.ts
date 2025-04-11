import { Injectable } from '@angular/core';
import { DE_TRANSLATIONS } from '../../assets/i18n/de';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private translations = DE_TRANSLATIONS;

  get(key: keyof typeof DE_TRANSLATIONS): string {
    return this.translations[key];
  }
}
