import { Directive, Input, TemplateRef, ViewContainerRef, inject, effect } from '@angular/core';
import { PermissionService } from '@core/services/permission.service';
import { PermissionType } from '@core/constants/permissions';

@Directive({
  selector: '[appHasPermission]',
  standalone: true,
})
export class HasPermissionDirective {
  private permissionService = inject(PermissionService);
  private templateRef = inject(TemplateRef<any>);
  private viewContainer = inject(ViewContainerRef);

  private permissions: PermissionType | PermissionType[] = [];
  private isVisible = false;

  @Input()
  set appHasPermission(value: PermissionType | PermissionType[]) {
    this.permissions = value;
    this.updateView();
  }

  private updateView() {
    const hasPermission = Array.isArray(this.permissions)
      ? this.permissionService.hasAnyPermission(this.permissions)
      : this.permissionService.hasPermission(this.permissions);

    if (hasPermission && !this.isVisible) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.isVisible = true;
    } else if (!hasPermission && this.isVisible) {
      this.viewContainer.clear();
      this.isVisible = false;
    }
  }
}
