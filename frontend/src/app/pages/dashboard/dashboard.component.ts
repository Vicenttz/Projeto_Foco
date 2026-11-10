import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MOCK_DISCIPLINES, MOCK_EVENTS, MOCK_PROJECTS, MOCK_TASKS, MOCK_USER } from '../../mocks/mock-data';
import { BadgeComponent } from '../../shared/badge/badge.component';
import { ProgressBarComponent } from '../../shared/progress-bar/progress-bar.component';

@Component({
  selector: 'foco-dashboard', standalone: true, imports: [DatePipe, RouterLink, BadgeComponent, ProgressBarComponent],
  template: `<div class="stack">
    <div><h1>Olá, {{ user.nome }}</h1><p class="muted">Veja o que merece sua atenção hoje.</p></div>
    <div class="grid">
      <section class="card stack"><h3>Foco atual</h3><p>{{ tasks[0].titulo }}</p><foco-badge [tone]="tasks[0].prioridade">{{ tasks[0].prioridade }}</foco-badge>
        <a class="btn btn-secondary" routerLink="/foco">Abrir foco</a></section>
      <section class="card stack"><h3>Resumo das tarefas</h3>
        <p class="muted">{{ pendentes }} pendentes de {{ tasks.length }}</p><foco-progress [value]="concluidas" label="Tarefas concluídas" /></section>
      <section class="card stack"><h3>Próximo do prazo</h3>
        @for (t of tasks; track t.id) { <div class="row-between"><span>{{ t.titulo }}</span><span class="muted">{{ t.prazo | date:'dd/MM' }}</span></div> }</section>
      <section class="card stack"><h3>Disciplinas</h3>
        @for (d of disciplinas; track d.id) { <div><p>{{ d.nome }}</p><foco-progress [value]="d.progresso" [label]="d.nome" /></div> }</section>
      <section class="card stack"><h3>Projetos ativos</h3>
        @for (p of projetos; track p.id) { <div><p>{{ p.nome }}</p><foco-progress [value]="p.progresso" [label]="p.nome" /></div> }</section>
      <section class="card stack"><h3>Próximos compromissos</h3>
        @for (e of eventos; track e.id) { <div class="row-between"><span>{{ e.titulo }}</span><span class="muted">{{ e.data | date:'dd/MM' }}</span></div> }</section>
      <section class="card stack"><h3>Assistente de IA</h3><p class="muted">Peça sugestões de tarefas ou de um calendário de estudos.</p>
        <a class="btn" routerLink="/assistente">Conversar</a></section>
    </div></div>`,
})
export class DashboardComponent {
  user = MOCK_USER; tasks = MOCK_TASKS; disciplinas = MOCK_DISCIPLINES; projetos = MOCK_PROJECTS; eventos = MOCK_EVENTS;
  pendentes = this.tasks.filter(t => t.status !== 'concluida').length;
  concluidas = Math.round(100 * this.tasks.filter(t => t.status === 'concluida').length / this.tasks.length);
}
