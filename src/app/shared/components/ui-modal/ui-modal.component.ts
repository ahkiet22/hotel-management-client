import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, X } from 'lucide-angular';
import { HlmButton } from '@spartan-ng/helm/button';
import { 
  HlmDialog, 
  HlmDialogContent, 
  HlmDialogHeader, 
  HlmDialogFooter, 
  HlmDialogTitle 
} from '@spartan-ng/helm/dialog';
import { BrnDialogContent } from '@spartan-ng/brain/dialog';

@Component({
  selector: 'app-ui-modal',
  standalone: true,
  imports: [
    CommonModule, 
    LucideAngularModule, 
    HlmButton, 
    HlmDialog, 
    HlmDialogContent, 
    HlmDialogHeader, 
    HlmDialogFooter, 
    HlmDialogTitle,
    BrnDialogContent
  ],
  template: `
    <hlm-dialog [state]="isOpen ? 'open' : 'closed'" (closed)="close.emit()">
      <ng-template brnDialogContent>
        <hlm-dialog-content [class]="sizeClasses" [showCloseButton]="false">
          <hlm-dialog-header class="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
            <h3 hlmDialogTitle class="text-xl font-bold tracking-tight text-slate-900">{{ title }}</h3>
            <button 
              (click)="close.emit()"
              class="p-2 rounded-lg hover:bg-slate-200/50 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <lucide-icon [img]="icons.X" class="w-4 h-4"></lucide-icon>
            </button>
          </hlm-dialog-header>

          <div class="py-6 overflow-y-auto max-h-[70vh]">
            <ng-content></ng-content>
          </div>

          <hlm-dialog-footer *ngIf="showFooter" class="flex flex-row justify-end gap-3 pt-4 border-t">
            <button hlmBtn variant="ghost" (click)="close.emit()" class="font-bold">Cancel</button>
            <div class="flex gap-3">
              <ng-content select="[footer]"></ng-content>
            </div>
          </hlm-dialog-footer>
        </hlm-dialog-content>
      </ng-template>
    </hlm-dialog>
  `,
})
export class UiModalComponent {
  @Input() isOpen = false;
  @Input() title: string = 'Modal Title';
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
  @Input() showFooter: boolean = true;
  @Output() close = new EventEmitter<void>();

  icons = { X };

  get sizeClasses() {
    return {
      'sm:max-w-sm': this.size === 'sm',
      'sm:max-w-md': this.size === 'md',
      'sm:max-w-xl': this.size === 'lg',
      'sm:max-w-3xl': this.size === 'xl',
    };
  }
}
