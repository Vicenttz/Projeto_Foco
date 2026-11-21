import { DatePipe } from '@angular/common';
<<<<<<< HEAD
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { isoLocal } from '../../core/util/data';
import { ToastService } from '../../core/ui/toast.service';
import { CalendarEvent, EventType } from '../../models';
import { EventsService } from '../../services/events.service';
import { BadgeComponent } from '../../shared/badge/badge.component';
import { IconComponent } from '../../shared/icon/icon.component';
import { ModalComponent } from '../../shared/modal/modal.component';

const iso = isoLocal;
interface Celula { dia: number | null; data: string; eventos: CalendarEvent[]; hoje: boolean; }

@Component({
  selector: 'foco-calendario', standalone: true, imports: [DatePipe, FormsModule, BadgeComponent, IconComponent, ModalComponent],
  template: `<div class="stack"><div class="row-between"><h1>Calendário</h1>
    <button class="btn" type="button" (click)="abrir()"><foco-icon name="plus" />Novo evento</button></div>
    <section class="card stack"><div class="row-between"><button class="btn btn-secondary btn-icon" type="button" (click)="mudar(-1)" aria-label="Mês anterior"><foco-icon name="left" /></button>
      <h2 style="text-transform:capitalize">{{ mes() | date:'MMMM yyyy' }}</h2>
      <button class="btn btn-secondary btn-icon" type="button" (click)="mudar(1)" aria-label="Próximo mês"><foco-icon name="right" /></button></div>
      <div class="cal">@for (s of semana; track s) { <div class="cal-h">{{ s }}</div> }
        @for (c of celulas(); track $index) {
          <button type="button" class="cal-d" [class.vazio]="!c.dia" [class.hoje]="c.hoje" (click)="c.dia && abrir(undefined, c.data)" [attr.aria-label]="c.dia ? 'Dia ' + c.dia : null">
            <span class="n">{{ c.dia }}</span>
            @for (e of c.eventos.slice(0, 2); track e.id) { <span class="cal-ev" [class]="'cal-ev ' + e.tipo" (click)="abrir(e); $event.stopPropagation()">{{ e.titulo }}</span> }
            @if (c.eventos.length > 2) { <span class="cal-ev">+{{ c.eventos.length - 2 }}</span> }</button> }</div></section>
    <section class="card stack"><h3>Neste mês</h3>
      @for (e of doMes(); track e.id) { <div class="row-between"><div><b>{{ e.titulo }}</b><p class="muted">{{ e.data | date:'EEEE, dd/MM' }}</p></div>
        <div class="row"><foco-badge>{{ e.tipo }}</foco-badge><button class="btn btn-ghost btn-icon" type="button" (click)="abrir(e)" aria-label="Editar evento"><foco-icon name="edit" [size]="18" /></button></div></div>
      } @empty { <p class="muted">Nenhum evento neste mês. Clique em um dia para criar.</p> }</section>
    @if (aberto()) { <foco-modal [titulo]="f.id ? 'Editar evento' : 'Novo evento'" (fechar)="aberto.set(false)"><div class="stack">
      <div class="field"><label for="t">Título</label><input id="t" [(ngModel)]="f.titulo" /></div>
      <div class="form-grid"><div class="field"><label for="d">Data</label><input id="d" type="date" [(ngModel)]="f.data" /></div>
        <div class="field"><label for="tp">Tipo</label><select id="tp" [(ngModel)]="f.tipo"><option value="evento">Evento</option><option value="entrega">Entrega</option><option value="estudo">Estudo</option><option value="tarefa">Tarefa</option></select></div></div>
      @if (erro()) { <p class="erro">{{ erro() }}</p> }
      <div class="modal-acoes">@if (f.id) { <button class="btn btn-danger" type="button" (click)="excluir()"><foco-icon name="trash" [size]="16" />Excluir</button> }
        <button class="btn btn-secondary" type="button" (click)="aberto.set(false)">Cancelar</button><button class="btn" type="button" (click)="salvar()">Salvar</button></div></div></foco-modal> }</div>`,
})
export class CalendarioComponent implements OnInit {
  private api = inject(EventsService); private toast = inject(ToastService);
  semana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  eventos = signal<CalendarEvent[]>([]); mes = signal(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  aberto = signal(false); erro = signal('');
  f: { id?: number; titulo: string; data: string; tipo: EventType } = { titulo: '', data: iso(new Date()), tipo: 'evento' };

  celulas = computed<Celula[]>(() => {
    const m = this.mes(), total = new Date(m.getFullYear(), m.getMonth() + 1, 0).getDate(), hojeIso = iso(new Date()), out: Celula[] = [];
    for (let i = 0; i < m.getDay(); i++) out.push({ dia: null, data: '', eventos: [], hoje: false });
    for (let d = 1; d <= total; d++) { const data = iso(new Date(m.getFullYear(), m.getMonth(), d)); out.push({ dia: d, data, eventos: this.eventos().filter(e => e.data === data), hoje: data === hojeIso }); }
    return out;
  });
  doMes = computed(() => { const p = iso(this.mes()).slice(0, 7); return this.eventos().filter(e => e.data.startsWith(p)); });

  ngOnInit() { this.carregar(); }
  carregar() { this.api.list().subscribe({ next: l => this.eventos.set(l), error: e => this.toast.erro(e) }); }
  mudar(n: number) { const m = this.mes(); this.mes.set(new Date(m.getFullYear(), m.getMonth() + n, 1)); }
  abrir(e?: CalendarEvent, data?: string) { this.f = e ? { id: e.id, titulo: e.titulo, data: e.data, tipo: e.tipo } : { titulo: '', data: data ?? iso(new Date()), tipo: 'evento' }; this.erro.set(''); this.aberto.set(true); }
  salvar() {
    if (!this.f.titulo.trim() || !this.f.data) { this.erro.set('Informe título e data.'); return; }
    const corpo = { titulo: this.f.titulo.trim(), data: this.f.data, tipo: this.f.tipo };
    (this.f.id ? this.api.update(this.f.id, corpo) : this.api.create(corpo)).subscribe({ next: () => { this.aberto.set(false); this.toast.ok('Evento salvo!'); this.carregar(); }, error: e => this.toast.erro(e) });
  }
  excluir() { if (!this.f.id || !confirm('Excluir este evento?')) return; this.api.remove(this.f.id).subscribe({ next: () => { this.aberto.set(false); this.toast.ok('Evento excluído.'); this.carregar(); }, error: e => this.toast.erro(e) }); }
}
=======
import { Component } from '@angular/core';
import { MOCK_EVENTS } from '../../mocks/mock-data';
import { BadgeComponent } from '../../shared/badge/badge.component';

/** Visão em lista por data. Calendário mensal completo fica como próximo passo. */
@Component({
  selector: 'foco-calendario', standalone: true, imports: [DatePipe, BadgeComponent],
  template: `<div class="stack"><h1>Calendário</h1>
    @for (e of eventos; track e.id) { <article class="card row-between"><div><h3>{{ e.titulo }}</h3>
      <p class="muted">{{ e.data | date:'EEEE, dd/MM/yyyy' }}</p></div><foco-badge>{{ e.tipo }}</foco-badge></article> }</div>`,
})
export class CalendarioComponent { eventos = [...MOCK_EVENTS].sort((a, b) => a.data.localeCompare(b.data)); }
>>>>>>> 12b45406a4e2c88ad2859f63e82f6d5ce74d09ca
