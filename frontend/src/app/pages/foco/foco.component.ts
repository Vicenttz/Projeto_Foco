import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { ToastService } from '../../core/ui/toast.service';
import { confete } from '../../core/ui/confetti';
import { FocoInfo, Task } from '../../models';
import { FocoService } from '../../services/foco.service';
import { TasksService } from '../../services/tasks.service';
import { BadgeComponent } from '../../shared/badge/badge.component';
import { EmptyStateComponent } from '../../shared/empty-state/empty-state.component';
import { IconComponent } from '../../shared/icon/icon.component';
import { ProgressBarComponent } from '../../shared/progress-bar/progress-bar.component';

@Component({
  selector: 'foco-foco', standalone: true, imports: [DatePipe, BadgeComponent, ProgressBarComponent, IconComponent, EmptyStateComponent],
  template: `<div class="stack"><h1>Foco e prioridades</h1>
    @if (info(); as i) {
      @if (i.atual; as a) {
        <section class="card hero stack"><h3>Foco atual</h3><h2>{{ a.titulo }}</h2><p class="muted">{{ a.descricao }} Prazo: {{ a.prazo | date:'dd/MM/yyyy' }}</p>
          <foco-progress [value]="i.progresso" label="Progresso do foco" />
          <div class="row"><button class="btn" type="button" (click)="concluir(a, $event)"><foco-icon name="check" />Concluir tarefa</button>
            <button class="btn" type="button" (click)="limpar()">Limpar escolha</button></div></section>
      } @else { <foco-empty-state title="Sem tarefa em foco" message="Crie uma tarefa para começar." /> }
      <section class="card stack" style="align-items:center;text-align:center"><h3>Temporizador de foco</h3>
        <div class="timer" aria-live="off">{{ mmss() }}</div>
        <div class="row"><button class="chip" type="button" [class.on]="duracao === 25" (click)="definir(25)">25 min</button><button class="chip" type="button" [class.on]="duracao === 15" (click)="definir(15)">15 min</button><button class="chip" type="button" [class.on]="duracao === 5" (click)="definir(5)">Pausa 5 min</button></div>
        <div class="row"><button class="btn" type="button" (click)="alternar()"><foco-icon [name]="rodando() ? 'pause' : 'play'" />{{ rodando() ? 'Pausar' : 'Iniciar' }}</button>
          <button class="btn btn-secondary" type="button" (click)="definir(duracao)"><foco-icon name="reset" [size]="18" />Reiniciar</button></div></section>
      <h2>Prioridades</h2>
      @for (t of i.prioridades; track t.id) { <article class="card row-between lift"><span>{{ t.titulo }}</span>
        <span class="row"><foco-badge [tone]="t.prioridade">{{ t.prioridade }}</foco-badge><span class="muted">{{ t.prazo | date:'dd/MM' }}</span>
          <button class="btn btn-secondary btn-sm" type="button" (click)="focar(t)"><foco-icon name="star" [size]="16" />Focar nisso</button></span></article> }
    }</div>`,
})
export class FocoComponent implements OnInit, OnDestroy {
  private api = inject(FocoService); private tasks = inject(TasksService); private toast = inject(ToastService);
  info = signal<FocoInfo | null>(null); restante = signal(25 * 60); rodando = signal(false); duracao = 25;
  private id: ReturnType<typeof setInterval> | null = null;

  ngOnInit() { this.carregar(); }
  ngOnDestroy() { this.parar(); }
  carregar() { this.api.obter().subscribe({ next: i => this.info.set(i), error: e => this.toast.erro(e) }); }
  focar(t: Task) { this.api.definir(t.id).subscribe({ next: i => this.info.set(i), error: e => this.toast.erro(e) }); }
  limpar() { this.api.limpar().subscribe({ next: () => this.carregar(), error: e => this.toast.erro(e) }); }
  concluir(t: Task, ev: Event) { this.tasks.update(t.id, { status: 'concluida' }).subscribe({ next: () => { confete(ev.currentTarget as HTMLElement); this.toast.ok('Tarefa concluída! 🎉'); this.carregar(); }, error: e => this.toast.erro(e) }); }

  mmss() { const s = this.restante(); return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; }
  definir(min: number) { this.parar(); this.duracao = min; this.restante.set(min * 60); }
  alternar() {
    if (this.rodando()) { this.parar(); return; }
    this.rodando.set(true);
    this.id = setInterval(() => {
      this.restante.update(s => s - 1);
      if (this.restante() <= 0) { this.parar(); this.restante.set(this.duracao * 60); confete(); this.toast.ok('Tempo concluído! Hora de respirar. 🌿'); }
    }, 1000);
  }
  private parar() { if (this.id) clearInterval(this.id); this.id = null; this.rodando.set(false); }
}
