import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { BaseService } from './base.service';
import SERVICES_DATA from '@assets/mocks/services.json';

export interface HotelService {
  id: string;
  name: string;
  description: string;
  price: number;
  status: 'Active' | 'Inactive';
}

const MOCK_SERVICES = SERVICES_DATA as unknown as HotelService[];

@Injectable({
  providedIn: 'root',
})
export class HotelServiceService extends BaseService<HotelService> {
  protected override readonly endpoint = 'api/v1/services';

  override getAll(query?: any): Observable<HotelService[]> {
    return of(MOCK_SERVICES);
  }

  override getById(id: string | number): Observable<HotelService> {
    const service = MOCK_SERVICES.find((s) => s.id === id);
    if (!service) throw new Error('Service not found');
    return of(service);
  }
}
