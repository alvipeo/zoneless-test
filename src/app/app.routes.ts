import { Routes } from '@angular/router';
import { IlgHome } from './home/ilg-home';

export const routes: Routes = [
   {
      path: '',
      component: IlgHome,
   },
   {
      path: 'register',
      loadComponent: () => import('./sign-up/sign-up-form').then((m) => m.IlgSignUpForm),
   },
];
