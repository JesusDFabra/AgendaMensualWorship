import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'miembros',
    loadComponent: () =>
      import('./features/members/member-list/member-list.component').then((m) => m.MemberListComponent),
  },
  {
    path: 'miembros/:id',
    loadComponent: () =>
      import('./features/members/member-detail/member-detail.component').then((m) => m.MemberDetailComponent),
  },
  {
    path: 'calendario',
    loadComponent: () =>
      import('./features/calendar/calendar.component').then((m) => m.CalendarComponent),
  },
  {
    path: 'agenda',
    loadComponent: () =>
      import('./features/agenda/agenda-list/agenda-list.component').then((m) => m.AgendaListComponent),
  },
  {
    path: 'agenda/mes/:year/:month',
    loadComponent: () =>
      import('./features/agenda/agenda-month/agenda-month.component').then((m) => m.AgendaMonthComponent),
  },
  {
    path: 'agenda/:id',
    loadComponent: () =>
      import('./features/agenda/service-detail/service-detail.component').then((m) => m.ServiceDetailComponent),
  },
  {
    path: 'canciones',
    loadComponent: () =>
      import('./features/canciones/cancion-list.component').then((m) => m.CancionListComponent),
  },
  { path: '**', redirectTo: '' },
];
