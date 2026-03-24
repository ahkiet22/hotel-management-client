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
        loadComponent: () =>
          import('./features/manager/users/user-list.component').then((m) => m.UserListComponent),
      },
      {
        path: 'rooms',
        loadComponent: () =>
          import('./features/manager/rooms/room-list.component').then((m) => m.RoomListComponent),
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: '**', component: NotFoundComponent },
    ],
  },
  // Global wildcard
  { path: '**', redirectTo: '404' },
];
