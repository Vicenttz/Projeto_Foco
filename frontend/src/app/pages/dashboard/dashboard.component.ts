import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { ToastService } from '../../core/ui/toast.service';
import { Dashboard } from '../../models';
import { FocoService } from '../../services/foco.service';
import { ArtComponent } from '../../shared/art/art.component';
import { BadgeComponent } from '../../shared/badge/badge.component';
import { ProgressBarComponent } from '../../shared/progress-bar/progress-bar.component';

@Component({
  selector: 'foco-dashboard', standalone: true, imports: [DatePipe, RouterLink, BadgeComponent, ProgressBarComponent, ArtComponent],
  template: `@if (d(); as d) {<div class="stack">
    <section class="card hero"><div class="row-between" style="flex-wrap:nowrap">
      <div class="stack" style="gap:.7rem"><h1>Olá, {{ d.usuario.nome }}!</h1><p class="muted">Veja o que merece sua atenção hoje.</p>
        @if (d.focoAtual; as f) { <p><b>Foco atual:</b> {{ f.titulo }}</p><div><a class="btn" routerLink="/foco">Abrir foco</a></div> }
        @else { <p>Você não tem tarefas abertas. Que tal criar uma?</p><div><a class="btn" routerLink="/tarefas">Nova tarefa</a></div> }</div>
      <foco-art tipo="hero" style="max-width:230px;width:100%" /></div></section>
    <div class="grid">
      <div class="card stat"><b>{{ d.resumoTarefas.pendentes }}</b><span class="muted">pendentes</span></div>
      <div class="card stat"><b>{{ d.resumoTarefas.emAndamento }}</b><span class="muted">em andamento</span></div>
      <div class="card stat"><b>{{ d.resumoTarefas.concluidas }}</b><span class="muted">concluídas</span></div>
      <div class="card stat"><b>{{ d.projetosAtivos.length }}</b><span class="muted">projetos ativos</span></div></div>
    <div class="grid-2">
      <section class="card stack"><h3>Progresso geral</h3><foco-progress [value]="d.resumoTarefas.percentualConcluidas" label="Tarefas concluídas" />
        <h3>Próximas tarefas</h3>
        @for (t of d.proximasTarefas; track t.id) { <div class="row-between"><span class="row"><foco-badge [tone]="t.prioridade">{{ t.prioridade }}</foco-badge>{{ t.titulo }}</span><span class="muted">{{ t.prazo | date:'dd/MM' }}</span></div> }
        @empty { <p class="muted">Nenhuma tarefa aberta.</p> }</section>
      <section class="card stack"><h3>Disciplinas</h3>
        @for (x of d.disciplinas; track x.id) { <div><p>{{ x.nome }}</p><foco-progress [value]="x.progresso" [label]="x.nome" /></div> }
        @empty { <p class="muted">Cadastre sua primeira disciplina.</p> }</section>
      <section class="card stack"><h3>Projetos ativos</h3>
        @for (p of d.projetosAtivos; track p.id) { <div><p>{{ p.nome }}</p><foco-progress [value]="p.progresso" [label]="p.nome" /></div> }
        @empty { <p class="muted">Nenhum projeto ativo.</p> }</section>
      <section class="card stack"><h3>Próximos compromissos</h3>
        @for (e of d.proximosEventos; track e.id) { <div class="row-between"><span>{{ e.titulo }}</span><span class="muted">{{ e.data | date:'dd/MM' }}</span></div> }
        @empty { <p class="muted">Sem compromissos próximos.</p> }</section>
    </div></div>} @else if (erro()) { <p class="erro">Não foi possível carregar o painel.</p> }`,
})
export class DashboardComponent implements OnInit {
  private api = inject(FocoService); private toast = inject(ToastService); auth = inject(AuthService);
  d = signal<Dashboard | null>(null); erro = signal(false);
  ngOnInit() { this.api.dashboard().subscribe({ next: v => this.d.set(v), error: e => { this.erro.set(true); this.toast.erro(e); } }); }
}
