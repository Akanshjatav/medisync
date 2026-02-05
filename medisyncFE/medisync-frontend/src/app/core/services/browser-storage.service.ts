import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class BrowserStorageService {
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  getItem(key: string, storage: 'session' | 'local' = 'session'): string | null {
    if (!this.isBrowser) return null;
    try {
      return storage === 'session' 
        ? sessionStorage.getItem(key) 
        : localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  setItem(key: string, value: string, storage: 'session' | 'local' = 'session'): void {
    if (!this.isBrowser) return;
    try {
      storage === 'session'
        ? sessionStorage.setItem(key, value)
        : localStorage.setItem(key, value);
    } catch (error) {
      console.error('Storage error:', error);
    }
  }

  removeItem(key: string, storage: 'session' | 'local' = 'session'): void {
    if (!this.isBrowser) return;
    try {
      storage === 'session'
        ? sessionStorage.removeItem(key)
        : localStorage.removeItem(key);
    } catch (error) {
      console.error('Storage error:', error);
    }
  }

  clear(storage: 'session' | 'local' | 'both' = 'both'): void {
    if (!this.isBrowser) return;
    try {
      if (storage === 'session' || storage === 'both') sessionStorage.clear();
      if (storage === 'local' || storage === 'both') localStorage.clear();
    } catch (error) {
      console.error('Storage error:', error);
    }
  }

  hasItem(key: string, storage: 'session' | 'local' = 'session'): boolean {
    return this.getItem(key, storage) !== null;
  }
}
