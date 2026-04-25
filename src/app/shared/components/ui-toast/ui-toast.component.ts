import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ToastItem, ToastService } from '@core/services/toast.service';
import { LucideAngularModule, X } from 'lucide-angular';

@Component({
  selector: 'app-ui-toast',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './ui-toast.component.html',
})
export class UiToastComponent {
  protected readonly icons = { X };
  protected readonly toastService = inject(ToastService);

  getToasts(): ToastItem[] {
    return this.toastService.toasts();
  }

  dismiss(id: number): void {
    this.toastService.dismiss(id);
  }

  getContainerClass(type: ToastItem['type']): string {
    switch (type) {
      case 'success':
        return 'border-emerald-500 bg-emerald-50';
      case 'error':
        return 'border-rose-500 bg-rose-50';
      case 'warning':
        return 'border-amber-500 bg-amber-50';
      default:
        return 'border-blue-500 bg-blue-50';
    }
  }

  getTitleClass(type: ToastItem['type']): string {
    switch (type) {
      case 'success':
        return 'text-emerald-700';
      case 'error':
        return 'text-rose-700';
      case 'warning':
        return 'text-amber-700';
      default:
        return 'text-blue-700';
    }
  }
}
