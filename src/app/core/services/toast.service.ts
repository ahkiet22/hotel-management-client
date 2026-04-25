import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: number;
  type: ToastType;
  title: string;
  message?: string;
  duration: number;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private nextId = 1;
  toasts = signal<ToastItem[]>([]);

  success(title: string, message?: string, duration = 3000): void {
    this.show({ type: 'success', title, message, duration });
  }

  error(title: string, message?: string, duration = 4500): void {
    this.show({ type: 'error', title, message, duration });
  }

  info(title: string, message?: string, duration = 3000): void {
    this.show({ type: 'info', title, message, duration });
  }

  warning(title: string, message?: string, duration = 4000): void {
    this.show({ type: 'warning', title, message, duration });
  }

  dismiss(id: number): void {
    this.toasts.update((items) => items.filter((toast) => toast.id !== id));
  }

  private show(input: Omit<ToastItem, 'id'>): void {
    const toast: ToastItem = {
      id: this.nextId++,
      ...input,
    };

    this.toasts.update((items) => [...items, toast]);

    window.setTimeout(() => {
      this.dismiss(toast.id);
    }, toast.duration);
  }
}
