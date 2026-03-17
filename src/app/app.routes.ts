import { Routes } from '@angular/router';
import { HomePageComponent } from './features/home/home.component';
import { ExplorePageComponent } from './features/explore/explore.component';

export const routes: Routes = [
  {
    path: '',
    component: HomePageComponent,
  },
  {
    path: 'explore',
    component: ExplorePageComponent,
  },
];
