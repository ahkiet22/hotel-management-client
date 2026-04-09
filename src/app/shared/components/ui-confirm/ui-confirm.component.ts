import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, AlertTriangle, X } from 'lucide-angular';
import { HlmButton } from '@spartan-ng/helm/button';

@Component({
  selector: 'app-ui-confirm',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, HlmButton],
  template: `
    @if (isOpen) {
      <div class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-black/50 backdrop-blur-sm"
          (click)="onCancel()"
        ></div>

        <!-- Dialog -->
        <div
          class="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden z-10
                 animate-in fade-in zoom-in-95 duration-200"
        >
          <!-- Header -->
          <div class="p-6 pb-4">
            <div class="flex items-start gap-4">
              <div class="p-3 rounded-full flex-shrink-0"
                   [ngClass]="variant === 'danger' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'">
                <lucide-icon [img]="icons.AlertTriangle" class="w-6 h-6"></lucide-icon>
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="text-lg font-bold text-slate-900">{{ title }}</h3>
                <p class="text-sm text-slate-500 mt-1 leading-relaxed">{{ message }}</p>
              </div>
              <button
                (click)="onCancel()"
                class="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0"
              >
                <lucide-icon [img]="icons.X" class="w-4 h-4"></lucide-icon>
              </button>
            </div>
          </div>

          <!-- Footer -->
          <div class="bg-slate-50 px-6 py-4 flex justify-end gap-3 border-t border-slate-100">
            <button
              hlmBtn
              variant="ghost"
              (click)="onCancel()"
              class="font-bold text-slate-600 hover:text-slate-900"
            >
              {{ cancelText }}
            </button>
            <button
              hlmBtn
              (click)="onConfirm()"
              [ngClass]="variant === 'danger'
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-amber-500 hover:bg-amber-600 text-white'"
              class="font-bold"
            >
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class UiConfirmComponent {
  @Input() isOpen = false;
  @Input() title = 'Confirm Action';
  @Input() message = 'Are you sure you want to proceed? This action cannot be undone.';
  @Input() confirmText = 'Confirm';
  @Input() cancelText = 'Cancel';
  @Input() variant: 'danger' | 'warning' = 'danger';

  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  icons = { AlertTriangle, X };

  onConfirm() {
    this.confirmed.emit();
  }

  onCancel() {
    this.cancelled.emit();
  }
}
