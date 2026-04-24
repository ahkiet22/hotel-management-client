import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { BaseService } from './base.service';
import { ApiResponse } from '../interfaces/common.dto';
import { 
  CustomerStats, 
  ReportQueryDto, 
  RevenueStats, 
  RoomStats, 
  ReportSummary 
} from '../interfaces/report.interface';

@Injectable({
  providedIn: 'root'
})
export class ReportService extends BaseService {
  protected override readonly endpoint = 'api/v1/reports';

  private getReportParams(query: ReportQueryDto): HttpParams {
    let params = new HttpParams();
    if (query.startDate) params = params.set('startDate', query.startDate);
    if (query.endDate) params = params.set('endDate', query.endDate);
    if (query.month) params = params.set('month', query.month.toString());
    if (query.year) params = params.set('year', query.year.toString());
    if (query.type) params = params.set('type', query.type);
    return params;
  }

  getSummary(query: ReportQueryDto): Observable<ReportSummary> {
    const params = this.getReportParams(query);
    return this.http.get<ApiResponse<ReportSummary>>(`${this.baseUrl}${this.endpoint}/summary`, { params })
      .pipe(
        map(res => res.data),
        catchError(this.handleError)
      );
  }

  getRoomStats(query: ReportQueryDto): Observable<RoomStats> {
    const params = this.getReportParams(query);
    return this.http.get<ApiResponse<RoomStats>>(`${this.baseUrl}${this.endpoint}/rooms`, { params })
      .pipe(
        map(res => res.data),
        catchError(this.handleError)
      );
  }

  getRevenueStats(query: ReportQueryDto): Observable<RevenueStats> {
    const params = this.getReportParams(query);
    return this.http.get<ApiResponse<RevenueStats>>(`${this.baseUrl}${this.endpoint}/revenue`, { params })
      .pipe(
        map(res => res.data),
        catchError(this.handleError)
      );
  }

  getCustomerStats(query: ReportQueryDto): Observable<CustomerStats> {
    const params = this.getReportParams(query);
    return this.http.get<ApiResponse<CustomerStats>>(`${this.baseUrl}${this.endpoint}/customers`, { params })
      .pipe(
        map(res => res.data),
        catchError(this.handleError)
      );
  }

  exportCsv(query: ReportQueryDto): Observable<Blob> {
    const params = this.getReportParams(query);
    return this.http.get(`${this.baseUrl}${this.endpoint}/export`, { 
      params, 
      responseType: 'blob' 
    }).pipe(
      catchError(this.handleError)
    );
  }
}
