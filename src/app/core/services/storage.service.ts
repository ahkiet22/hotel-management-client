import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  // Map Cache (RAM)
  private cache = new Map<string, any>();
  private readonly isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  /**
   * Store: Update RAM và Disk
   */
  set(key: string, value: any): void {
    try {
      this.cache.set(key, value); // Update RAM
      if (this.isBrowser) {
        const serializedValue = JSON.stringify(value);
        localStorage.setItem(key, serializedValue); // Update Disk
      }
    } catch (e) {
      console.error('Error saving to storage', e);
    }
  }

  /**
   * Get data: prioty RAM, after to Disk
   */
  get<T>(key: string): T | null {
    if (this.cache.has(key)) {
      return this.cache.get(key) as T;
    }

    if (!this.isBrowser) return null;

    try {
      const data = localStorage.getItem(key);
      if (data) {
        const parsedData = JSON.parse(data) as T;
        this.cache.set(key, parsedData);
        return parsedData;
      }
    } catch (e) {
      console.error('Error reading from storage', e);
    }

    return null;
  }

  /**
   * Remove: ram and disk
   */
  remove(key: string): void {
    this.cache.delete(key);
    if (this.isBrowser) {
      localStorage.removeItem(key);
    }
  }

  /**
   * clear all data: ram and disk
   */
  clear(): void {
    this.cache.clear();
    if (this.isBrowser) {
      localStorage.clear();
    }
  }

  /**
   * Refresh Cache
   */
  refreshCache(key: string): void {
    this.cache.delete(key);
    this.get(key);
  }
}
