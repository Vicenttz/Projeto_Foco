import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '../../core/ui/toast.service';
import { MESES, SEMANA_CURTA, SEMANA_LONGA, dataValida, diasAte, isoLocal, paraData } from '../../core/util/data';
import { CalendarEvent, Discipline, EventType } from '../../models';
import { BriefingService } from '../../services/briefing.service';
import { DisciplinesService } from '../../services/disciplines.service';
import { EventsService } from '../../services/events.service';
import { BadgeComponent, BadgeTone } from '../../shared/badge/badge.component';
import { IconComponent } from '../../shared/icon/icon.component';
import { ModalComponent } from '../../shared/modal/modal.component';

type Visao = 'mes' | 'semana';
interface Dia { dia: number | null; data: string; eventos: CalendarEvent[]; hoje: boolean; }
interface Form {
  id?: number; tipo: EventType; titulo: string; data: string; hora: string; duracaoMin: number | null;
  disciplinaId: number | null; descricao: string; concluido: boolean;
}

const TIPOS: { id: EventType; nome: string; dica: string }[] = [
  { id: 'prova', nome: 'Prova', dica: 'Ex.: Prova de Cálculo' },
  { id: 'estudo', nome: 'Estudo', dica: 'Ex.: Revisar integrais' },
  { id: 'entrega', nome: 'Entrega', dica: 'Ex.: Entrega do protótipo' },
  { id: 'tarefa', nome: 'Tarefa', dica: 'Ex.: Revisão em grupo' },
  { id: 'evento', nome: 'Evento', dica: 'Ex.: Palestra' },
];
const ordenar = (a: CalendarEvent, b: CalendarEvent) => (a.hora ?? '').localeCompare(b.hora ?? '') || a.id - b.id;

/**
 * Calendário interativo: agende provas e sessões de estudo, arraste para mudar o dia, marque estudos como feitos.
 * O assistente de IA lê esta agenda para montar a mensagem do dia (veja BriefingService).
 */
@Component({
  selector: 'foco-calendario', standalone: true, imports: [FormsModule, BadgeComponent, IconComponent, ModalComponent],
  template: `<div class="stack">
    <div class="row-between">
      <div><h1>Calendário</h1><p class="muted">Agende provas e sessões de estudo. O assistente lê sua agenda e avisa você todo dia.</p></div>
      <div class="row">
        <button class="btn btn-secondary" type="button" (click)="abrir(undefined, 'estudo')"><foco-icon name="plus" [size]="18" />Estudo</button>
        <button class="btn" type="button" (click)="abrir(undefined, 'prova')"><foco-icon name="plus" [size]="18" />Prova</button>
        <button class="btn btn-secondary" type="button" (click)="abrir(undefined, 'evento')"><foco-icon name="plus" [size]="18" />Evento</button>
      </div>
    </div>

    <section class="card stack">
      <div class="row-between">
        <div class="row">
          <button class="btn btn-secondary btn-icon" type="button" (click)="navegar(-1)" [attr.aria-label]="visao() === 'mes' ? 'Mês anterior' : 'Semana anterior'"><foco-icon name="left" /></button>
          <button class="btn btn-secondary btn-icon" type="button" (click)="navegar(1)" [attr.aria-label]="visao() === 'mes' ? 'Próximo mês' : 'Próxima semana'"><foco-icon name="right" /></button>
          <button class="btn btn-secondary btn-sm" type="button" (click)="irHoje()">Hoje</button>
          <h2 class="titulo">{{ titulo() }}</h2>
        </div>
        <div class="row">
          <button class="chip" type="button" [class.on]="visao() === 'mes'" (click)="mudarVisao('mes')">Mês</button>
          <button class="chip" type="button" [class.on]="visao() === 'semana'" (click)="mudarVisao('semana')">Semana</button>
        </div>
      </div>
      <div class="row" aria-label="Filtrar por tipo">
        @for (t of tipos; track t.id) {
          <button class="chip leg" type="button" [class.off]="oculto(t.id)" (click)="alternarTipo(t.id)" [attr.aria-pressed]="!oculto(t.id)">
            <span class="pt" [class]="'t-' + t.id"></span>{{ t.nome }}</button>
        }
      </div>
    </section>

    <div class="layout">
      <section class="card stack">
        <div class="grade" [class.semana]="visao() === 'semana'">
          @if (visao() === 'mes') { @for (s of semanaCurta; track s) { <div class="cab">{{ s }}</div> } }
          @for (c of dias(); track $index) {
            <div class="dia" [class.vazio]="!c.dia" [class.hoje]="c.hoje" [class.sel]="!!c.data && c.data === sel()" [class.alvo]="!!c.data && alvo() === c.data"
                 (click)="selecionar(c)" (dblclick)="c.dia && abrir(undefined, 'evento', c.data)"
                 (dragover)="sobre($event, c)" (dragleave)="alvo.set('')" (drop)="soltar($event, c)">
              @if (c.dia) {
                <span class="n">{{ visao() === 'semana' ? semanaCurta[$index] + ' ' : '' }}{{ c.dia }}</span>
                @for (e of c.eventos.slice(0, limite()); track e.id) {
                  <button type="button" class="ev" [class]="'t-' + e.tipo" [class.feito]="!!e.concluido" draggable="true"
                          (dragstart)="arrastar($event, e)" (dragend)="arrastando = null; alvo.set('')"
                          (click)="abrir(e); $event.stopPropagation()" [attr.title]="e.titulo">
                    <span class="t">{{ e.hora ? e.hora + ' ' : '' }}{{ e.titulo }}</span></button>
                }
                @if (c.eventos.length > limite()) { <span class="mais">+{{ c.eventos.length - limite() }} mais</span> }
              }
            </div>
          }
        </div>
        <p class="muted dica">Clique em um dia para ver a agenda dele. Arraste um compromisso para outro dia para reagendar. Clique duas vezes em um dia para criar um evento.</p>
      </section>

      <aside class="stack">
        <section class="card stack">
          <div class="row-between"><h3>{{ rotuloSel() }}</h3><button class="btn btn-sm" type="button" (click)="abrir(undefined, 'estudo', sel())"><foco-icon name="plus" [size]="16" />Agendar</button></div>
          @for (e of doDia(); track e.id) {
            <div class="item" [class]="'t-' + e.tipo" [class.feito]="!!e.concluido">
              <span class="hora">{{ horario(e) }}</span>
              <div class="info"><b>{{ e.titulo }}</b>
                <p class="muted">{{ nomeTipo(e.tipo) }}@if (nomeDisc(e.disciplinaId)) { · {{ nomeDisc(e.disciplinaId) }} }</p>
                @if (e.descricao) { <p class="muted">{{ e.descricao }}</p> }</div>
              <div class="row" style="gap:.15rem;flex-wrap:nowrap">
                @if (e.tipo !== 'prova') {
                  <button class="btn btn-ghost btn-icon" type="button" (click)="alternarConcluido(e)" [attr.aria-label]="e.concluido ? 'Marcar como não feito' : 'Marcar como feito'" [title]="e.concluido ? 'Desfazer' : 'Marcar como feito'"><foco-icon name="check" [size]="18" /></button>
                }
                <button class="btn btn-ghost btn-icon" type="button" (click)="abrir(e)" aria-label="Editar compromisso"><foco-icon name="edit" [size]="18" /></button>
              </div>
            </div>
          } @empty { <p class="muted">Nada agendado neste dia.</p> }
        </section>

        <section class="card stack">
          <h3>Próximas provas</h3>
          @for (e of proximasProvas(); track e.id) {
            <div class="row-between"><div><b>{{ e.titulo }}</b><p class="muted">{{ dataCurta(e.data) }}@if (e.hora) { · {{ e.hora }} }</p></div>
              <foco-badge [tone]="tom(e)">{{ contagem(e) }}</foco-badge></div>
          } @empty { <p class="muted">Nenhuma prova agendada. Use o botão "Prova" para agendar.</p> }
        </section>

        <section class="card">
          <p class="muted">Estudo agendado {{ visao() === 'mes' ? 'neste mês' : 'nesta semana' }}</p>
          <h3>{{ horasEstudo() }}</h3>
        </section>
      </aside>
    </div>

    @if (aberto()) {
      <foco-modal [titulo]="f.id ? 'Editar compromisso' : 'Agendar'" (fechar)="aberto.set(false)">
        <div class="stack">
          <div class="row">
            @for (t of tipos; track t.id) { <button class="chip" type="button" [class.on]="f.tipo === t.id" (click)="trocarTipo(t.id)">{{ t.nome }}</button> }
          </div>
          <div class="field"><label for="ev-t">Título</label><input id="ev-t" [(ngModel)]="f.titulo" [placeholder]="dica()" maxlength="200" /></div>
          <div class="form-grid">
            <div class="field"><label for="ev-d">Data</label><input id="ev-d" type="date" [(ngModel)]="f.data" /></div>
            <div class="field"><label for="ev-h">Horário (opcional)</label><input id="ev-h" type="time" [(ngModel)]="f.hora" /></div>
            <div class="field"><label for="ev-m">Duração em minutos (opcional)</label><input id="ev-m" type="number" min="5" max="1440" step="5" [(ngModel)]="f.duracaoMin" /></div>
            <div class="field"><label for="ev-s">Disciplina (opcional)</label>
              <select id="ev-s" [(ngModel)]="f.disciplinaId"><option [ngValue]="null">Nenhuma</option>
                @for (d of disciplinas(); track d.id) { <option [ngValue]="d.id">{{ d.nome }}</option> }</select></div>
            <div class="field full"><label for="ev-o">Observações (opcional)</label><textarea id="ev-o" rows="2" [(ngModel)]="f.descricao" maxlength="2000"></textarea></div>
          </div>
          @if (f.tipo !== 'prova') { <label class="row"><input type="checkbox" [(ngModel)]="f.concluido" /> Já fiz / concluído</label> }
          @if (erro()) { <p class="erro">{{ erro() }}</p> }
          <div class="modal-acoes">
            @if (f.id) { <button class="btn btn-danger" type="button" (click)="excluir()"><foco-icon name="trash" [size]="16" />Excluir</button> }
            <button class="btn btn-secondary" type="button" (click)="aberto.set(false)">Cancelar</button>
            <button class="btn" type="button" (click)="salvar()">Salvar</button>
          </div>
        </div>
      </foco-modal>
    }
  </div>`,
  styles: [`
    .titulo { text-transform: capitalize; margin-left: .25rem; }
    .layout { display: grid; grid-template-columns: minmax(0, 1fr) 330px; gap: var(--space-4); align-items: start; }
    @media (max-width: 1000px) { .layout { grid-template-columns: 1fr; } }
    .grade { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 6px; }
    .cab { text-align: center; font-size: var(--fs-small); color: var(--color-text-muted); font-weight: 600; padding: .3rem 0; }
    .dia { min-height: 98px; display: flex; flex-direction: column; gap: 3px; padding: .35rem; cursor: pointer; border-radius: var(--radius-sm);
      border: 1px solid var(--color-border); background: var(--color-surface-solid); transition: border-color .15s, background .15s; }
    .dia:hover { border-color: var(--color-primary); }
    .dia.vazio { visibility: hidden; cursor: default; }
    .dia.hoje { border-color: var(--color-primary); box-shadow: inset 0 0 0 1px var(--color-primary); }
    .dia.sel { background: color-mix(in srgb, var(--color-primary) 10%, var(--color-surface-solid)); }
    .dia.alvo { outline: 2px dashed var(--color-primary); outline-offset: -2px; }
    .semana .dia { min-height: 280px; }
    .n { font-size: var(--fs-small); font-weight: 600; }
    .hoje .n { color: var(--color-primary); }
    .ev { display: block; width: 100%; text-align: left; font: inherit; font-size: .72rem; line-height: 1.3; padding: 2px 6px; cursor: grab;
      border: 0; border-left: 3px solid var(--cor); border-radius: 5px; color: var(--color-text);
      background: color-mix(in srgb, var(--cor) 16%, transparent); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .ev:active { cursor: grabbing; }
    .ev.feito { text-decoration: line-through; opacity: .6; }
    .mais { font-size: .68rem; color: var(--color-text-muted); }
    .dica { font-size: var(--fs-small); }
    .t-prova { --cor: var(--color-red); } .t-estudo { --cor: var(--color-green); } .t-entrega { --cor: var(--color-orange); }
    .t-tarefa { --cor: var(--color-blue); } .t-evento { --cor: var(--color-primary); }
    .pt { display: inline-block; width: .6rem; height: .6rem; border-radius: 50%; background: var(--cor); margin-right: .4rem; }
    .leg { display: inline-flex; align-items: center; } .leg.off { opacity: .45; }
    .item { display: flex; gap: .6rem; align-items: flex-start; padding: .55rem .6rem; border-radius: var(--radius-sm);
      border-left: 4px solid var(--cor); background: color-mix(in srgb, var(--cor) 9%, transparent); }
    .item .hora { min-width: 4.2rem; font-size: var(--fs-small); color: var(--color-text-muted); }
    .item .info { flex: 1; min-width: 0; }
    .item.feito b { text-decoration: line-through; opacity: .65; }
    @media (max-width: 700px) {
      .semana { grid-template-columns: 1fr; } .semana .dia { min-height: auto; }
      .grade:not(.semana) .dia { min-height: 54px; }
      .grade:not(.semana) .ev { height: 6px; padding: 0; } .grade:not(.semana) .ev .t { display: none; }
    }
  `],
})
export class CalendarioComponent implements OnInit {
  private api = inject(EventsService); private disc = inject(DisciplinesService); private toast = inject(ToastService);
  private briefing = inject(BriefingService); private rota = inject(ActivatedRoute); private router = inject(Router);

  tipos = TIPOS; semanaCurta = SEMANA_CURTA;
  eventos = signal<CalendarEvent[]>([]); disciplinas = signal<Discipline[]>([]);
  visao = signal<Visao>('mes'); ref = signal(new Date()); sel = signal(isoLocal());
  ocultos = signal<EventType[]>([]); alvo = signal('');
  aberto = signal(false); erro = signal('');
  arrastando: CalendarEvent | null = null;
  f: Form = this.vazio('evento', isoLocal());

  visiveis = computed(() => this.eventos().filter(e => !this.ocultos().includes(e.tipo)));
  limite = computed(() => (this.visao() === 'semana' ? 99 : 3));

  dias = computed<Dia[]>(() => {
    const ev = this.visiveis(), hojeIso = isoLocal(), r = this.ref(), out: Dia[] = [];
    const montar = (d: Date): Dia => {
      const data = isoLocal(d);
      return { dia: d.getDate(), data, eventos: ev.filter(e => e.data === data).sort(ordenar), hoje: data === hojeIso };
    };
    if (this.visao() === 'semana') {
      const ini = new Date(r.getFullYear(), r.getMonth(), r.getDate() - r.getDay());
      for (let i = 0; i < 7; i++) out.push(montar(new Date(ini.getFullYear(), ini.getMonth(), ini.getDate() + i)));
      return out;
    }
    const total = new Date(r.getFullYear(), r.getMonth() + 1, 0).getDate(), primeiro = new Date(r.getFullYear(), r.getMonth(), 1).getDay();
    for (let i = 0; i < primeiro; i++) out.push({ dia: null, data: '', eventos: [], hoje: false });
    for (let d = 1; d <= total; d++) out.push(montar(new Date(r.getFullYear(), r.getMonth(), d)));
    return out;
  });

  titulo = computed(() => {
    const r = this.ref();
    if (this.visao() === 'mes') return `${MESES[r.getMonth()]} ${r.getFullYear()}`;
    const ini = new Date(r.getFullYear(), r.getMonth(), r.getDate() - r.getDay()), fim = new Date(ini.getFullYear(), ini.getMonth(), ini.getDate() + 6);
    const f = (d: Date) => `${d.getDate()} de ${MESES[d.getMonth()].toLowerCase()}`;
    return `${f(ini)} a ${f(fim)}`;
  });
  rotuloSel = computed(() => { const d = paraData(this.sel()); return `${SEMANA_LONGA[d.getDay()]}, ${d.getDate()} de ${MESES[d.getMonth()].toLowerCase()}`; });
  doDia = computed(() => this.visiveis().filter(e => e.data === this.sel()).sort(ordenar));
  proximasProvas = computed(() => this.eventos().filter(e => e.tipo === 'prova' && diasAte(e.data) >= 0)
    .sort((a, b) => a.data.localeCompare(b.data) || ordenar(a, b)).slice(0, 4));
  horasEstudo = computed(() => {
    const min = this.dias().reduce((s, d) => s + d.eventos.filter(e => e.tipo === 'estudo').reduce((t, e) => t + (e.duracaoMin ?? 0), 0), 0);
    if (min < 60) return `${min} min`;
    return `${Math.floor(min / 60)}h${min % 60 ? String(min % 60).padStart(2, '0') : ''}`;
  });

  ngOnInit() {
    this.carregar();
    this.disc.list().subscribe({ next: l => this.disciplinas.set(l), error: () => { /* o formulário funciona sem disciplinas */ } });
    // Vindo de uma sugestão do assistente: /calendario?novo=estudo&data=AAAA-MM-DD&disciplinaId=1
    const q = this.rota.snapshot.queryParamMap, novo = q.get('novo') as EventType | null;
    if (novo && this.tipos.some(t => t.id === novo)) {
      const data = dataValida(q.get('data')) ? q.get('data')! : isoLocal(), did = Number(q.get('disciplinaId'));
      this.sel.set(data); this.ref.set(paraData(data));
      this.abrir(undefined, novo, data, did > 0 ? did : null);
      this.router.navigate(['/calendario'], { replaceUrl: true }); // limpa os parâmetros da URL
    }
  }

  carregar() { this.api.list().subscribe({ next: l => this.eventos.set(l), error: e => this.toast.erro(e) }); }

  // ---- navegação e filtros ----
  navegar(n: number) {
    const r = this.ref();
    this.ref.set(this.visao() === 'mes' ? new Date(r.getFullYear(), r.getMonth() + n, 1) : new Date(r.getFullYear(), r.getMonth(), r.getDate() + 7 * n));
  }
  irHoje() { this.ref.set(new Date()); this.sel.set(isoLocal()); }
  mudarVisao(v: Visao) {
    const s = paraData(this.sel()), r = this.ref();
    if (v === 'semana' && s.getMonth() === r.getMonth() && s.getFullYear() === r.getFullYear()) this.ref.set(s);
    this.visao.set(v);
  }
  selecionar(c: Dia) { if (c.data) this.sel.set(c.data); }
  oculto(t: EventType) { return this.ocultos().includes(t); }
  alternarTipo(t: EventType) { this.ocultos.update(l => (l.includes(t) ? l.filter(x => x !== t) : [...l, t])); }

  // ---- arrastar e soltar para reagendar ----
  arrastar(ev: DragEvent, e: CalendarEvent) {
    this.arrastando = e;
    ev.dataTransfer?.setData('text/plain', String(e.id));
    if (ev.dataTransfer) ev.dataTransfer.effectAllowed = 'move';
  }
  sobre(ev: DragEvent, c: Dia) { if (this.arrastando && c.data) { ev.preventDefault(); this.alvo.set(c.data); } }
  soltar(ev: DragEvent, c: Dia) {
    ev.preventDefault();
    const e = this.arrastando; this.arrastando = null; this.alvo.set('');
    if (!e || !c.data || e.data === c.data) return;
    this.eventos.update(l => l.map(x => (x.id === e.id ? { ...x, data: c.data } : x)));
    this.sel.set(c.data);
    this.api.update(e.id, { data: c.data }).subscribe({
      next: () => { this.briefing.invalidar(); this.toast.ok('Compromisso reagendado.'); },
      error: err => { this.toast.erro(err); this.carregar(); },
    });
  }

  // ---- formulário ----
  vazio(tipo: EventType, data: string): Form {
    return { tipo, titulo: '', data, hora: '', duracaoMin: tipo === 'estudo' ? 60 : null, disciplinaId: null, descricao: '', concluido: false };
  }
  abrir(e?: CalendarEvent, tipo: EventType = 'evento', data?: string, disciplinaId: number | null = null) {
    this.f = e
      ? { id: e.id, tipo: e.tipo, titulo: e.titulo, data: e.data, hora: e.hora ?? '', duracaoMin: e.duracaoMin ?? null,
          disciplinaId: e.disciplinaId ?? null, descricao: e.descricao ?? '', concluido: !!e.concluido }
      : { ...this.vazio(tipo, data ?? this.sel()), disciplinaId };
    this.erro.set(''); this.aberto.set(true);
  }
  trocarTipo(t: EventType) { this.f.tipo = t; if (t === 'estudo' && !this.f.duracaoMin) this.f.duracaoMin = 60; }
  dica() { return this.tipos.find(t => t.id === this.f.tipo)?.dica ?? ''; }

  salvar() {
    const f = this.f;
    if (!f.titulo.trim() || !f.data) { this.erro.set('Informe o título e a data.'); return; }
    if (f.duracaoMin !== null && (f.duracaoMin < 5 || f.duracaoMin > 1440)) { this.erro.set('A duração deve ficar entre 5 e 1440 minutos.'); return; }
    const corpo = {
      titulo: f.titulo.trim(), data: f.data, tipo: f.tipo, hora: f.hora || null, duracaoMin: f.duracaoMin || null,
      disciplinaId: f.disciplinaId, descricao: f.descricao.trim() || null, concluido: f.tipo === 'prova' ? false : f.concluido,
    };
    (f.id ? this.api.update(f.id, corpo) : this.api.create(corpo)).subscribe({
      next: () => { this.aberto.set(false); this.sel.set(f.data); this.toast.ok('Agendado!'); this.briefing.invalidar(); this.carregar(); },
      error: e => this.toast.erro(e),
    });
  }
  excluir() {
    if (!this.f.id || !confirm('Excluir este compromisso?')) return;
    this.api.remove(this.f.id).subscribe({
      next: () => { this.aberto.set(false); this.toast.ok('Compromisso excluído.'); this.briefing.invalidar(); this.carregar(); },
      error: e => this.toast.erro(e),
    });
  }
  alternarConcluido(e: CalendarEvent) {
    const novo = !e.concluido;
    this.eventos.update(l => l.map(x => (x.id === e.id ? { ...x, concluido: novo } : x)));
    this.api.update(e.id, { concluido: novo }).subscribe({
      next: () => this.briefing.invalidar(),
      error: err => { this.toast.erro(err); this.carregar(); },
    });
  }

  // ---- apresentação ----
  nomeTipo(t: EventType) { return this.tipos.find(x => x.id === t)?.nome ?? t; }
  nomeDisc(id?: number | null) { return id ? this.disciplinas().find(d => d.id === id)?.nome ?? '' : ''; }
  horario(e: CalendarEvent) { return e.hora ? (e.duracaoMin ? `${e.hora} · ${e.duracaoMin} min` : e.hora) : 'Dia todo'; }
  dataCurta(iso: string) { const d = paraData(iso); return `${SEMANA_CURTA[d.getDay()]}, ${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`; }
  contagem(e: CalendarEvent) { const n = diasAte(e.data); return n === 0 ? 'hoje' : n === 1 ? 'amanhã' : `em ${n} dias`; }
  tom(e: CalendarEvent): BadgeTone { const n = diasAte(e.data); return n <= 3 ? 'alta' : n <= 7 ? 'media' : 'baixa'; }
}
