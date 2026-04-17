import { Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { Role } from '../interfaces';

@Injectable({
  providedIn: 'root',
})
export class RoleService extends BaseService<Role> {
  protected override readonly endpoint = 'api/v1/roles';
}
