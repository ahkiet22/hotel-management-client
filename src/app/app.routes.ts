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

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        component: HomePageComponent,
      },
      {
        path: 'explore',
        component: ExplorePageComponent,
      },
      {
        path: 'rooms',
        component: RoomsPageComponent,
      },
      {
        path: 'about',
        component: AboutPageComponent,
      },
      {
        path: 'contact',
        component: ContactPageComponent,
      },
      {
        path: 'login',
        component: LoginComponent,
      },
      {
        path: 'register',
        component: RegisterComponent,
      },
      {
        path: 'forgot-password',
        component: ForgotPasswordComponent,
      },
    ],
  },
];
