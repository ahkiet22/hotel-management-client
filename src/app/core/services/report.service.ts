import { Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { Observable, map, catchError } from 'rxjs';
import { ApiResponse } from '@core/interfaces/api';
import { 
  ReportQuery, 
  ReportSummary, 
  RoomStats, 
  RevenueStats, 
  CustomerStats 
} from '@core/interfaces/report.interface';

@Injectable({
  providedIn: 'root'
})
export class ReportService extends BaseService<any> {
  protected readonly endpoint = 'api/v1/reports';

  getSummary(query?: ReportQuery): Observable<ReportSummary> {
    const params = this.buildParams(query);
    return this.http.get<ApiResponse<ReportSummary>>(`${this.fullUrl}/summary`, { params }).pipe(
      map(res => res.data),
      catchError(this.handleError)
    );
  }

  getRoomStats(query?: ReportQuery): Observable<RoomStats> {
    const params = this.buildParams(query);
    return this.http.get<ApiResponse<RoomStats>>(`${this.fullUrl}/rooms`, { params }).pipe(
      map(res => res.data),
      catchError(this.handleError)
    );
  }

  getRevenueStats(query?: ReportQuery): Observable<RevenueStats> {
    const params = this.buildParams(query);
    return this.http.get<ApiResponse<RevenueStats>>(`${this.fullUrl}/revenue`, { params }).pipe(
      map(res => res.data),
      catchError(this.handleError)
    );
  }

  getCustomerStats(query?: ReportQuery): Observable<CustomerStats> {
    const params = this.buildParams(query);
    return this.http.get<ApiResponse<CustomerStats>>(`${this.fullUrl}/customers`, { params }).pipe(
      map(res => res.data),
      catchError(this.handleError)
    );
  }

  exportCsv(query?: ReportQuery): Observable<Blob> {
    const params = this.buildParams(query);
    return this.http.get(`${this.fullUrl}/export`, { 
      params, 
      responseType: 'blob' 
    });
  }
}
