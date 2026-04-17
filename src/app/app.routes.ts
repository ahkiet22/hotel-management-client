import { Routes } from '@angular/router';
import { HomePageComponent } from './features/home/home.component';
import { ExplorePageComponent } from './features/explore/explore.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { RoomsPageComponent } from './features/rooms/rooms.component';
import { AboutPageComponent } from './features/about/about.component';
import { ContactPageComponent } from './features/contact/contact.component';
import { LoginComponent } from './features/login/login.component';
import { RegisterComponent } from './features/register/register.component';
import { ForgotPasswordComponent } from './features/forgot-password/forgot-password.component';
import { publicGuard } from '@core/guards/public.guard';
import { permissionGuard } from '@core/guards/permission.guard';
import { PERMISSIONS } from '@core/constants/permissions';

import { NotFoundComponent } from './features/not-found/not-found.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', component: HomePageComponent },
      { path: 'explore', component: ExplorePageComponent },
      { path: 'rooms', component: RoomsPageComponent },
      {
        path: 'rooms/:id',

        loadComponent: () =>
          import('./features/rooms/room-detail/room-detail.component').then(
            (m) => m.RoomDetailComponent,
          ),
      },
      {
        path: 'booking',
        loadComponent: () =>
          import('./features/booking/booking.component').then((m) => m.BookingPageComponent),
      },
      { path: 'about', component: AboutPageComponent },
      { path: 'contact', component: ContactPageComponent },

      {
        path: 'account',
        loadComponent: () =>
          import('./features/account/account.component').then((m) => m.AccountComponent),
        children: [
          {
            path: 'profile',
            loadComponent: () =>
              import('./features/account/profile/profile.component').then((m) => m.ProfileComponent),
          },
          {
            path: 'history-booking',
            loadComponent: () =>
              import('./features/account/history-booking/history-booking.component').then(
                (m) => m.HistoryBookingComponent,
              ),
          },
          { path: '', redirectTo: 'profile', pathMatch: 'full' },
        ],
      },
      {
        path: '',
        canActivate: [publicGuard],
        children: [
          { path: 'login', component: LoginComponent },
          { path: 'register', component: RegisterComponent },
          { path: 'forgot-password', component: ForgotPasswordComponent },
        ],
      },
      // 404 Page inside layout
      { path: '404', component: NotFoundComponent },
    ],
  },
  {
    path: 'manager',
    loadComponent: () =>
      import('./layouts/manager-layout/manager-layout.component').then(
        (m) => m.ManagerLayoutComponent,
      ),
    // canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'users',
        canActivate: [permissionGuard],
        data: { permission: PERMISSIONS.MANAGE_USERS.VIEW },
        loadComponent: () =>
          import('./features/manager/users/user-list.component').then((m) => m.UserListComponent),
      },
      {
        path: 'rooms',
        loadComponent: () =>
          import('./features/manager/rooms/room-list.component').then((m) => m.RoomListComponent),
      },
      {
        path: 'room-types',
        loadComponent: () =>
          import('./features/manager/room-types/room-type-list.component').then(
            (m) => m.RoomTypeListComponent,
          ),
      },
      {
        path: 'services',
        loadComponent: () =>
          import('./features/manager/services/service-list.component').then(
            (m) => m.ServiceListComponent,
          ),
      },
      {
        path: 'receipts',
        loadComponent: () =>
          import('./features/manager/receipts/receipt-list.component').then(
            (m) => m.ReceiptListComponent,
          ),
      },
      {
        path: 'payments',
        loadComponent: () =>
          import('./features/manager/payments/payment-list.component').then(
            (m) => m.PaymentListComponent,
          ),
      },
      {
        path: 'reviews',
        loadComponent: () =>
          import('./features/manager/reviews/review-list.component').then(
            (m) => m.ReviewListComponent,
          ),
      },
      {
        path: 'settings/logs',
        canActivate: [permissionGuard],
        data: { permission: PERMISSIONS.SYSTEM.LOGS },
        loadComponent: () =>
          import('./features/manager/settings/logs/system-logs.component').then(
            (m) => m.SystemLogsComponent,
          ),
      },
      {
        path: 'bookings',
        loadComponent: () =>
          import('./features/manager/bookings/booking-list.component').then(
            (m) => m.BookingListComponent,
          ),
      },
      {
        path: 'reports/bookings',
        loadComponent: () =>
          import('./features/manager/reports/reports.component').then((m) => m.ReportsComponent),
      },
      {
        path: 'reports/occupancy',
        loadComponent: () =>
          import('./features/manager/reports/reports.component').then((m) => m.ReportsComponent),
      },
      {
        path: 'reports/revenue',
        loadComponent: () =>
          import('./features/manager/reports/reports.component').then((m) => m.ReportsComponent),
      },
      {
        path: 'reports/customers',
        loadComponent: () =>
          import('./features/manager/reports/reports.component').then((m) => m.ReportsComponent),
      },
      {
        path: 'reports/reviews',
        loadComponent: () =>
          import('./features/manager/reports/reports.component').then((m) => m.ReportsComponent),
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: '**', component: NotFoundComponent },
    ],
  },
  // Global wildcard
  { path: '**', redirectTo: '404' },
];
