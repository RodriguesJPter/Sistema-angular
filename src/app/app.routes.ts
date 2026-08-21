import { Routes } from '@angular/router';
import { HomeTela } from './screens/homeTela/homeTela';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  { path: 'home', component: HomeTela },

  { path: '**', redirectTo: 'home' }
];
