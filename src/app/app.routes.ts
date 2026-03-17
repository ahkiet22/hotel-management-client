import { Routes } from '@angular/router';
import { HomePageComponent } from './features/home/home.component';
import { ExplorePageComponent } from './features/explore/explore.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';

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
    ],
  },
];
