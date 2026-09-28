import { Routes } from '@angular/router';
import { LoginComponent } from './pages/auth/login/login.component';
import { LayoutComponent } from './pages/layout-dashboard/layout.component';
import { roleGuard } from './core/guards/role.guard';
import { RegisterComponent } from './pages/auth/register/register.component';
import { HomeComponent } from './pages/home/home.component';
import { authPagesGuard } from '@core/guards/auth.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [authPagesGuard]
  },
  {
    path: 'registro',
    component: RegisterComponent,
    canActivate: [authPagesGuard]
  },
  {
    path: 'canchas',
    loadComponent: () =>
      import('./features/venue/pages/venue-list/venue-list.component').then(
        m => m.VenueListComponent
      )
  },
  {
    path: 'reserva',
    loadComponent: () =>
      import('./features/reservation/pages/reservation-detail/reservation-detail.component').then(
        m => m.ReservationDetailComponent
      )
  },
  {
    path: 'r/:code',
    loadComponent: () =>
      import('./features/reservation/pages/reservation-form/reservation-form.component').then(
        m => m.ReservationFormComponent
      )
  },
  {
    path: 'dashboard',
    component: LayoutComponent,
    canActivate: [roleGuard],
    children: [
      {
        path: '',
        redirectTo: 'inicio',
        pathMatch: 'full'
      },
      {
        path: 'inicio',
        loadComponent: () =>
          import('./features/user/pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'complejo-deportivo',
        loadComponent: () =>
          import('./features/venue/pages/venue/venue.component').then(
            m => m.VenueComponent
          )
      },
      {
        path: 'canchas',
        loadComponent: () =>
          import('./features/field/pages/field/field.component').then(
            m => m.FieldComponent
          )
      },
      {
        path: 'reservas',
        loadComponent: () =>
          import('./features/reservation/pages/reservation-list/reservation-list.component').then(
            m => m.ReservationListComponent
          )
      },
      {
        path: 'perfil',
        loadComponent: () =>
          import('./features/user/pages/profile/profile.component').then(m => m.ProfileComponent)
      }
    ]
  },
  { path: '', redirectTo: '', pathMatch: 'full' },
  { path: '**', redirectTo: '' }
];
