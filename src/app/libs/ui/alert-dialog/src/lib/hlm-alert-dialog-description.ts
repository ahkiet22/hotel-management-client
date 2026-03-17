import { Directive } from '@angular/core';
import { BrnAlertDialogDescription } from '@spartan-ng/brain/alert-dialog';
import { classes } from 'src/app/libs/ui/utils/src';

@Directive({
  selector: '[hlmAlertDialogDescription]',
  hostDirectives: [BrnAlertDialogDescription],
  host: {
    'data-slot': 'alert-dialog-description',
  },
})
export class HlmAlertDialogDescription {
  constructor() {
    classes(() => 'text-muted-foreground text-sm');
  }
}
