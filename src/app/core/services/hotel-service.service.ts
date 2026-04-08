import { Injectable } from '@angular/core';
import { BaseService } from './base.service';

export interface HotelService {
  id: string;
  name: string;
  description: string;
  price: number;
  status: 'Active' | 'Inactive';
}

@Injectable({
  providedIn: 'root',
})
export class HotelServiceService extends BaseService<HotelService> {
  protected override readonly endpoint = 'api/v1/services';
}
