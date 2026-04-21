import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Dashboard } from './dashboard/dashboard';
import { Alumnos } from './alumnos/alumnos';
import { Maestros } from './maestros/maestros';
import { Finanzas } from './finanzas/finanzas';
import { Comedor } from './comedor/comedor';
import { CicloEscolar } from './ciclo-escolar/ciclo-escolar';
import { Reportes } from './reportes/reportes';

import { authGuard } from './core/auth.guard';

export const routes: Routes = [

  /* LOGIN */
  { path: 'login', component: Login },

  /* MÓDULOS PROTEGIDOS */
  { path: 'dashboard', component: Dashboard, canActivate: [authGuard] },
  { path: 'alumnos', component: Alumnos, canActivate: [authGuard] },
  { path: 'maestros', component: Maestros, canActivate: [authGuard] },
  { path: 'finanzas', component: Finanzas, canActivate: [authGuard] },
  { path: 'comedor', component: Comedor, canActivate: [authGuard] },
  { path: 'ciclo-escolar', component: CicloEscolar, canActivate: [authGuard] },
  { path: 'reportes', component: Reportes, canActivate: [authGuard] },

  /* INICIO */
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  /* CUALQUIER RUTA INVÁLIDA */
  { path: '**', redirectTo: 'login' }

];
