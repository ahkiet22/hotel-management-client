import { Component, OnDestroy, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { ReportService } from '@core/services/report.service';
import { 
  ReportType, 
  ReportSummary, 
  RoomStats, 
  RevenueStats, 
  CustomerStats 
} from '@core/interfaces/report.interface';
import { 
  LucideAngularModule, 
  BarChart3, 
  TrendingUp, 
  Users, 
  BedDouble,
  Download,
  Calendar,
  Filter
} from 'lucide-angular';
import { ToastService } from '@core/services/toast.service';
import { EMPTY, Subject, catchError, filter, finalize, forkJoin, of, takeUntil } from 'rxjs';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './reports.component.html',
})
export class ReportsComponent implements OnInit {
  private reportService = inject(ReportService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private destroy$ = new Subject<void>();

  loading = signal(false);
  exporting = signal(false);
  
  query = signal({
    startDate: this.getDefaultStartDate(),
    endDate: new Date().toISOString().split('T')[0],
    type: ReportType.DAY,
  });
  reportView = signal<'bookings' | 'occupancy' | 'revenue' | 'customers' | 'reviews' | 'overview'>('overview');
  reportTitle = signal('Analytics & Reports');
  reportSubtitle = signal('Monitor your hotel performance and growth.');

  summary = signal<ReportSummary | null>(null);
  roomStats = signal<RoomStats | null>(null);
  revenueStats = signal<RevenueStats | null>(null);
  customerStats = signal<CustomerStats | null>(null);

  icons = {
    BarChart3,
    TrendingUp,
    Users,
    BedDouble,
    Download,
    Calendar,
    Filter
  };

  reportTypes = Object.values(ReportType);

  ngOnInit() {
    this.resolveReportView();
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe(() => this.resolveReportView());

    this.fetchData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getDefaultStartDate() {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().split('T')[0];
  }

  fetchData() {
    this.loading.set(true);
    const q = this.query();

    const loadSummary = this.shouldLoad('summary')
      ? this.reportService.getSummary(q).pipe(catchError(() => of(null)))
      : of(null);
    const loadRoomStats = this.shouldLoad('rooms')
      ? this.reportService.getRoomStats(q).pipe(catchError(() => of(null)))
      : of(null);
    const loadRevenue = this.shouldLoad('revenue')
      ? this.reportService.getRevenueStats(q).pipe(catchError(() => of(null)))
      : of(null);
    const loadCustomers = this.shouldLoad('customers')
      ? this.reportService.getCustomerStats(q).pipe(catchError(() => of(null)))
      : of(null);

    forkJoin({
      summary: loadSummary,
      roomStats: loadRoomStats,
      revenueStats: loadRevenue,
      customerStats: loadCustomers,
    })
      .pipe(
        finalize(() => this.loading.set(false)),
        catchError((err) => {
          this.toastService.error('Failed to load reports', err?.message || 'Please try again.');
          return EMPTY;
        })
      )
      .subscribe((res) => {
        if (res.summary) this.summary.set(res.summary);
        if (res.roomStats) this.roomStats.set(res.roomStats);
        if (res.revenueStats) this.revenueStats.set(res.revenueStats);
        if (res.customerStats) this.customerStats.set(res.customerStats);
      });
  }

  onFilter() {
    this.fetchData();
  }

  exportReport() {
    this.exporting.set(true);
    this.reportService.exportCsv(this.query()).pipe(
      finalize(() => this.exporting.set(false))
    ).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${new Date().getTime()}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      this.toastService.success('Report exported', 'CSV file downloaded successfully.');
    }, (err) => {
      this.toastService.error('Export failed', err?.message || 'Could not export report.');
    });
  }

  updateStartDate(value: string) {
    this.query.update((q) => ({ ...q, startDate: value }));
  }

  updateEndDate(value: string) {
    this.query.update((q) => ({ ...q, endDate: value }));
  }

  updateType(value: ReportType) {
    this.query.update((q) => ({ ...q, type: value }));
  }

  isSectionVisible(section: 'summary' | 'rooms' | 'revenue' | 'customers'): boolean {
    const view = this.reportView();
    if (view === 'overview') return true;
    if (section === 'summary') return true;
    if (section === 'rooms') return view === 'bookings' || view === 'occupancy' || view === 'reviews';
    if (section === 'revenue') return view === 'revenue';
    return view === 'customers';
  }

  formatCurrency(value: string | number | undefined) {
    if (value === undefined || value === null) return '$0.00';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
  }

  getPercentage(current: number | string | undefined, total: number | string | undefined): number {
    const c = typeof current === 'string' ? parseFloat(current) : (current || 0);
    const t = typeof total === 'string' ? parseFloat(total) : (total || 1);
    return (c / t) * 100;
  }

  private shouldLoad(section: 'summary' | 'rooms' | 'revenue' | 'customers'): boolean {
    return this.isSectionVisible(section);
  }

  getKpis(): Array<{ label: string; value: string | number; badge: string; tone: 'blue' | 'emerald' | 'purple' | 'amber'; icon: 'TrendingUp' | 'BarChart3' | 'Users' | 'BedDouble' }> {
    const view = this.reportView();
    const summary = this.summary();
    const room = this.roomStats()?.summary;
    const revenue = this.revenueStats()?.summary;
    const customers = this.customerStats();

    if (view === 'revenue') {
      return [
        { label: 'Total Revenue', value: this.formatCurrency(revenue?.totalRevenue), badge: 'Revenue', tone: 'blue', icon: 'TrendingUp' },
        { label: 'Room Revenue', value: this.formatCurrency(revenue?.roomRevenue), badge: 'Rooms', tone: 'emerald', icon: 'BedDouble' },
        { label: 'Service Revenue', value: this.formatCurrency(revenue?.serviceRevenue), badge: 'Services', tone: 'amber', icon: 'BarChart3' },
        { label: 'Invoices', value: revenue?.totalInvoices ?? 0, badge: 'Billing', tone: 'purple', icon: 'BarChart3' },
      ];
    }

    if (view === 'customers') {
      return [
        { label: 'Active Customers', value: customers?.activeCustomers ?? summary?.customers?.active ?? 0, badge: 'Active', tone: 'purple', icon: 'Users' },
        { label: 'New Customers', value: customers?.newCustomers ?? summary?.customers?.new ?? 0, badge: 'New', tone: 'emerald', icon: 'Users' },
        { label: 'Top Customer Spend', value: this.formatCurrency(customers?.topCustomers?.[0]?.totalSpent), badge: 'VIP', tone: 'blue', icon: 'TrendingUp' },
        { label: 'Top Customer Bookings', value: customers?.topCustomers?.[0]?.totalBookings ?? 0, badge: 'Loyalty', tone: 'amber', icon: 'BarChart3' },
      ];
    }

    if (view === 'occupancy') {
      return [
        { label: 'Total Bookings', value: room?.totalBookings ?? summary?.rooms?.totalBookings ?? 0, badge: 'Occupancy', tone: 'blue', icon: 'BedDouble' },
        { label: 'Active Bookings', value: room?.activeBookings ?? 0, badge: 'In-house', tone: 'emerald', icon: 'Users' },
        { label: 'Completed', value: room?.completedBookings ?? 0, badge: 'Finished', tone: 'purple', icon: 'BarChart3' },
        { label: 'Cancelled', value: room?.cancelledBookings ?? 0, badge: 'Dropped', tone: 'amber', icon: 'BarChart3' },
      ];
    }

    if (view === 'bookings' || view === 'reviews') {
      return [
        { label: 'Total Bookings', value: room?.totalBookings ?? summary?.rooms?.totalBookings ?? 0, badge: 'Bookings', tone: 'blue', icon: 'BarChart3' },
        { label: 'Active Bookings', value: room?.activeBookings ?? 0, badge: 'Live', tone: 'emerald', icon: 'Users' },
        { label: 'Completed Bookings', value: room?.completedBookings ?? 0, badge: 'Completed', tone: 'purple', icon: 'TrendingUp' },
        { label: 'Cancelled Bookings', value: room?.cancelledBookings ?? 0, badge: 'Cancelled', tone: 'amber', icon: 'BarChart3' },
      ];
    }

    return [
      { label: 'Total Revenue', value: this.formatCurrency(summary?.revenue?.totalRevenue), badge: 'Revenue', tone: 'blue', icon: 'TrendingUp' },
      { label: 'Total Bookings', value: summary?.rooms?.totalBookings ?? 0, badge: 'Bookings', tone: 'emerald', icon: 'BarChart3' },
      { label: 'Active Customers', value: summary?.customers?.active ?? 0, badge: 'Active', tone: 'purple', icon: 'Users' },
      { label: 'New Registrations', value: summary?.customers?.new ?? 0, badge: 'New', tone: 'amber', icon: 'Users' },
    ];
  }

  getToneClass(tone: 'blue' | 'emerald' | 'purple' | 'amber'): { icon: string; badge: string } {
    const toneMap = {
      blue: { icon: 'bg-blue-50 text-blue-600', badge: 'text-blue-600 bg-blue-50' },
      emerald: { icon: 'bg-emerald-50 text-emerald-600', badge: 'text-emerald-600 bg-emerald-50' },
      purple: { icon: 'bg-purple-50 text-purple-600', badge: 'text-purple-600 bg-purple-50' },
      amber: { icon: 'bg-amber-50 text-amber-600', badge: 'text-amber-600 bg-amber-50' },
    };
    return toneMap[tone];
  }

  private resolveReportView() {
    const path = this.route.snapshot.routeConfig?.path || '';
    const key = path.split('/').pop() as 'bookings' | 'occupancy' | 'revenue' | 'customers' | 'reviews' | undefined;
    const current = key || 'overview';
    this.reportView.set(current);

    const titles: Record<string, string> = {
      overview: 'Analytics & Reports',
      bookings: 'Booking Report',
      occupancy: 'Occupancy Report',
      revenue: 'Revenue Report',
      customers: 'Customer Report',
      reviews: 'Review Report',
    };
    this.reportTitle.set(titles[current] || titles.overview);

    const subtitles: Record<string, string> = {
      overview: 'Monitor your hotel performance and growth.',
      bookings: 'Track booking volume, completion and cancellation trends.',
      occupancy: 'Analyze occupancy behavior and room type demand.',
      revenue: 'Inspect revenue performance by period and source.',
      customers: 'Understand customer activity and highest value guests.',
      reviews: 'Review booking quality and retention-related signals.',
    };
    this.reportSubtitle.set(subtitles[current] || subtitles.overview);
  }
}
