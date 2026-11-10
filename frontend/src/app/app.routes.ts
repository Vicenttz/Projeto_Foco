import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: 'login', loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent) },
  { path: 'cadastro', loadComponent: () => import('./pages/cadastro/cadastro.component').then(m => m.CadastroComponent) },
  {
    path: '', component: MainLayoutComponent, canActivate: [authGuard],
    children: [
      { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'disciplinas', loadComponent: () => import('./pages/disciplinas/disciplinas.component').then(m => m.DisciplinasComponent) },
      { path: 'tarefas', loadComponent: () => import('./pages/tarefas/tarefas.component').then(m => m.TarefasComponent) },
      { path: 'projetos', loadComponent: () => import('./pages/projetos/projetos.component').then(m => m.ProjetosComponent) },
      { path: 'trilhas', loadComponent: () => import('./pages/trilhas/trilhas.component').then(m => m.TrilhasComponent) },
      { path: 'calendario', loadComponent: () => import('./pages/calendario/calendario.component').then(m => m.CalendarioComponent) },
      { path: 'foco', loadComponent: () => import('./pages/foco/foco.component').then(m => m.FocoComponent) },
      { path: 'assistente', loadComponent: () => import('./pages/assistente/assistente.component').then(m => m.AssistenteComponent) },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
