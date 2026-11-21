import { DatePipe } from '@angular/common';
<<<<<<< HEAD
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { isoLocal } from '../../core/util/data';
import { ToastService } from '../../core/ui/toast.service';
import { confete } from '../../core/ui/confetti';
import { Discipline, Priority, Task, TaskStatus } from '../../models';
import { DisciplinesService } from '../../services/disciplines.service';
import { FocoService } from '../../services/foco.service';
import { TasksService } from '../../services/tasks.service';
import { BadgeComponent } from '../../shared/badge/badge.component';
import { EmptyStateComponent } from '../../shared/empty-state/empty-state.component';
import { IconComponent } from '../../shared/icon/icon.component';
import { ModalComponent } from '../../shared/modal/modal.component';

interface Form { id?: number; titulo: string; descricao: string; disciplinaId: number | null; prioridade: Priority; prazo: string; status: TaskStatus; }
const hoje = () => isoLocal();

@Component({
  selector: 'foco-tarefas', standalone: true, imports: [DatePipe, FormsModule, BadgeComponent, IconComponent, ModalComponent, EmptyStateComponent],
  template: `<div class="stack"><div class="row-between"><h1>Tarefas</h1>
    <button class="btn" type="button" (click)="abrir()"><foco-icon name="plus" />Nova tarefa</button></div>
    <div class="row">@for (fl of filtros; track fl.id) { <button class="chip" type="button" [class.on]="filtro() === fl.id" (click)="filtro.set(fl.id)">{{ fl.nome }}</button> }</div>
    @for (t of visiveis(); track t.id) {
      <article class="card row-between lift"><div class="stack" style="gap:.25rem;min-width:0">
        <h3 [style.text-decoration]="t.status === 'concluida' ? 'line-through' : null" [style.opacity]="t.status === 'concluida' ? .6 : 1">{{ t.titulo }}</h3>
        <p class="muted">{{ t.descricao }} {{ t.descricao && nomeDisc(t.disciplinaId) ? '·' : '' }} {{ nomeDisc(t.disciplinaId) }}</p></div>
        <div class="row"><foco-badge [tone]="t.prioridade">{{ t.prioridade }}</foco-badge>
          <span class="muted">{{ t.prazo | date:'dd/MM/yyyy' }}</span><foco-badge>{{ t.status.replace('_',' ') }}</foco-badge>
          @if (t.status !== 'concluida') { <button class="btn btn-ghost btn-icon" type="button" (click)="focar(t)" aria-label="Definir como foco" title="Definir como foco"><foco-icon name="star" [size]="18" /></button> }
          <button class="btn btn-secondary btn-sm" type="button" (click)="abrir(t)"><foco-icon name="edit" [size]="16" />Editar</button>
          <button class="btn btn-ghost btn-sm" type="button" (click)="alternar(t, $event)"><foco-icon name="check" [size]="16" />{{ t.status === 'concluida' ? 'Reabrir' : 'Concluir' }}</button>
          <button class="btn btn-danger btn-icon" type="button" (click)="excluir(t)" aria-label="Excluir tarefa"><foco-icon name="trash" [size]="16" /></button></div></article>
    } @empty { @if (carregado()) { <foco-empty-state title="Nenhuma tarefa aqui" message="Crie uma tarefa ou troque o filtro."><button class="btn" type="button" (click)="abrir()">Nova tarefa</button></foco-empty-state> } }
    @if (aberto()) { <foco-modal [titulo]="f.id ? 'Editar tarefa' : 'Nova tarefa'" (fechar)="aberto.set(false)"><div class="stack">
      <div class="form-grid"><div class="field full"><label for="t">Título</label><input id="t" [(ngModel)]="f.titulo" /></div>
        <div class="field full"><label for="d">Descrição</label><textarea id="d" rows="2" [(ngModel)]="f.descricao"></textarea></div>
        <div class="field"><label for="ds">Disciplina</label><select id="ds" [(ngModel)]="f.disciplinaId"><option [ngValue]="null">Nenhuma</option>@for (d of disciplinas(); track d.id) { <option [ngValue]="d.id">{{ d.nome }}</option> }</select></div>
        <div class="field"><label for="pz">Prazo</label><input id="pz" type="date" [(ngModel)]="f.prazo" /></div>
        <div class="field"><label for="pr">Prioridade</label><select id="pr" [(ngModel)]="f.prioridade"><option value="baixa">Baixa</option><option value="media">Média</option><option value="alta">Alta</option></select></div>
        <div class="field"><label for="st">Status</label><select id="st" [(ngModel)]="f.status"><option value="pendente">Pendente</option><option value="em_andamento">Em andamento</option><option value="concluida">Concluída</option></select></div></div>
      @if (erro()) { <p class="erro">{{ erro() }}</p> }
      <div class="modal-acoes"><button class="btn btn-secondary" type="button" (click)="aberto.set(false)">Cancelar</button><button class="btn" type="button" (click)="salvar()">Salvar</button></div></div></foco-modal> }</div>`,
})
export class TarefasComponent implements OnInit {
  private api = inject(TasksService); private discApi = inject(DisciplinesService); private focoApi = inject(FocoService); private toast = inject(ToastService);
  lista = signal<Task[]>([]); disciplinas = signal<Discipline[]>([]); carregado = signal(false);
  filtro = signal<'todas' | TaskStatus>('todas'); aberto = signal(false); erro = signal('');
  filtros: { id: 'todas' | TaskStatus; nome: string }[] = [{ id: 'todas', nome: 'Todas' }, { id: 'pendente', nome: 'Pendentes' }, { id: 'em_andamento', nome: 'Em andamento' }, { id: 'concluida', nome: 'Concluídas' }];
  visiveis = computed(() => this.lista().filter(t => this.filtro() === 'todas' || t.status === this.filtro()));
  f: Form = this.vazio();

  ngOnInit() { this.carregar(); this.discApi.list().subscribe({ next: d => this.disciplinas.set(d), error: e => this.toast.erro(e) }); }
  carregar() { this.api.list().subscribe({ next: l => { this.lista.set(l); this.carregado.set(true); }, error: e => this.toast.erro(e) }); }
  vazio(): Form { return { titulo: '', descricao: '', disciplinaId: null, prioridade: 'media', prazo: hoje(), status: 'pendente' }; }
  nomeDisc(id?: number | null) { return this.disciplinas().find(d => d.id === id)?.nome ?? ''; }
  abrir(t?: Task) { this.f = t ? { id: t.id, titulo: t.titulo, descricao: t.descricao ?? '', disciplinaId: t.disciplinaId ?? null, prioridade: t.prioridade, prazo: t.prazo, status: t.status } : this.vazio(); this.erro.set(''); this.aberto.set(true); }
  salvar() {
    if (!this.f.titulo.trim()) { this.erro.set('Informe o título da tarefa.'); return; }
    if (!this.f.prazo) { this.erro.set('Informe o prazo.'); return; }
    const { id, ...resto } = this.f; const corpo = { ...resto, titulo: resto.titulo.trim(), descricao: resto.descricao.trim() || null };
    (id ? this.api.update(id, corpo) : this.api.create(corpo)).subscribe({ next: () => { this.aberto.set(false); this.toast.ok('Tarefa salva!'); this.carregar(); }, error: e => this.toast.erro(e) });
  }
  alternar(t: Task, ev: Event) {
    const concluir = t.status !== 'concluida'; const alvo = ev.currentTarget as HTMLElement;
    this.api.update(t.id, { status: concluir ? 'concluida' : 'pendente' }).subscribe({ next: () => { if (concluir) { confete(alvo); this.toast.ok('Tarefa concluída! 🎉'); } this.carregar(); }, error: e => this.toast.erro(e) });
  }
  focar(t: Task) { this.focoApi.definir(t.id).subscribe({ next: () => this.toast.ok('Tarefa definida como foco ⭐'), error: e => this.toast.erro(e) }); }
  excluir(t: Task) { if (!confirm(`Excluir "${t.titulo}"?`)) return; this.api.remove(t.id).subscribe({ next: () => { this.toast.ok('Tarefa excluída.'); this.carregar(); }, error: e => this.toast.erro(e) }); }
=======
import { Component } from '@angular/core';
import { MOCK_DISCIPLINES, MOCK_TASKS } from '../../mocks/mock-data';
import { BadgeComponent } from '../../shared/badge/badge.component';
import { IconComponent } from '../../shared/icon/icon.component';

@Component({
  selector: 'foco-tarefas', standalone: true, imports: [DatePipe, BadgeComponent, IconComponent],
  template: `<div class="stack"><div class="row-between"><h1>Tarefas</h1>
    <button class="btn"><foco-icon name="plus" />Nova tarefa</button></div>
    @for (t of tarefas; track t.id) {
      <article class="card row-between"><div class="stack" style="gap:.25rem">
        <h3>{{ t.titulo }}</h3><p class="muted">{{ t.descricao }} {{ disciplina(t.disciplinaId) }}</p></div>
        <div class="row"><foco-badge [tone]="t.prioridade">{{ t.prioridade }}</foco-badge>
          <span class="muted">{{ t.prazo | date:'dd/MM/yyyy' }}</span><foco-badge>{{ t.status.replace('_',' ') }}</foco-badge>
          <button class="btn btn-secondary">Editar</button><button class="btn btn-ghost"><foco-icon name="check" />Concluir</button></div></article> }</div>`,
})
export class TarefasComponent {
  tarefas = MOCK_TASKS;
  disciplina(id?: number) { return MOCK_DISCIPLINES.find(d => d.id === id)?.nome ?? ''; }
>>>>>>> 12b45406a4e2c88ad2859f63e82f6d5ce74d09ca
}
