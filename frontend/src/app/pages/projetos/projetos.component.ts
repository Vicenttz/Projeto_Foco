import { DatePipe } from '@angular/common';
<<<<<<< HEAD
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { isoLocal } from '../../core/util/data';
import { ToastService } from '../../core/ui/toast.service';
import { confete } from '../../core/ui/confetti';
import { Project, Step, TaskStatus } from '../../models';
import { ProjectsService } from '../../services/projects.service';
import { BadgeComponent } from '../../shared/badge/badge.component';
import { EmptyStateComponent } from '../../shared/empty-state/empty-state.component';
import { IconComponent } from '../../shared/icon/icon.component';
import { ModalComponent } from '../../shared/modal/modal.component';
import { ProgressBarComponent } from '../../shared/progress-bar/progress-bar.component';
import { StepsEditorComponent } from '../../shared/steps-editor/steps-editor.component';

interface Form { id?: number; nome: string; descricao: string; dataEntrega: string; status: TaskStatus; etapas: Step[]; }

@Component({
  selector: 'foco-projetos', standalone: true,
  imports: [DatePipe, FormsModule, BadgeComponent, ProgressBarComponent, IconComponent, ModalComponent, EmptyStateComponent, StepsEditorComponent],
  template: `<div class="stack"><div class="row-between"><h1>Projetos</h1><button class="btn" type="button" (click)="abrir()"><foco-icon name="plus" />Novo projeto</button></div>
    @for (p of lista(); track p.id) {
      <article class="card stack lift"><div class="row-between"><h3>{{ p.nome }}</h3><foco-badge [tone]="p.status === 'concluida' ? 'ok' : 'brand'">{{ p.status.replace('_',' ') }}</foco-badge></div>
        <p class="muted">{{ p.descricao }} · entrega em {{ p.dataEntrega | date:'dd/MM/yyyy' }}</p>
        <foco-progress [value]="p.progresso" [label]="'Progresso de ' + p.nome" />
        <div class="stack" style="gap:.4rem">@for (e of p.etapas; track e.id) { <label class="row" style="cursor:pointer;flex-wrap:nowrap"><input type="checkbox" [checked]="e.concluida" (change)="marcar(p, e, $event)" /><span [style.opacity]="e.concluida ? .55 : 1">{{ e.titulo }}</span></label> }</div>
        <div class="row"><button class="btn btn-secondary btn-sm" type="button" (click)="abrir(p)"><foco-icon name="edit" [size]="16" />Editar</button>
          <button class="btn btn-danger btn-sm" type="button" (click)="excluir(p)"><foco-icon name="trash" [size]="16" />Excluir</button></div></article>
    } @empty { @if (carregado()) { <foco-empty-state title="Nenhum projeto" message="Organize um trabalho grande em etapas."><button class="btn" type="button" (click)="abrir()">Novo projeto</button></foco-empty-state> } }
    @if (aberto()) { <foco-modal [titulo]="f.id ? 'Editar projeto' : 'Novo projeto'" (fechar)="aberto.set(false)"><div class="stack">
      <div class="form-grid"><div class="field full"><label for="n">Nome</label><input id="n" [(ngModel)]="f.nome" /></div>
        <div class="field full"><label for="d">Descrição</label><textarea id="d" rows="2" [(ngModel)]="f.descricao"></textarea></div>
        <div class="field"><label for="e">Data de entrega</label><input id="e" type="date" [(ngModel)]="f.dataEntrega" /></div>
        <div class="field"><label for="s">Status</label><select id="s" [(ngModel)]="f.status"><option value="pendente">Pendente</option><option value="em_andamento">Em andamento</option><option value="concluida">Concluído</option></select></div></div>
      <h3>Etapas</h3><foco-steps-editor [etapas]="f.etapas" />
      @if (erro()) { <p class="erro">{{ erro() }}</p> }
      <div class="modal-acoes"><button class="btn btn-secondary" type="button" (click)="aberto.set(false)">Cancelar</button><button class="btn" type="button" (click)="salvar()">Salvar</button></div></div></foco-modal> }</div>`,
})
export class ProjetosComponent implements OnInit {
  private api = inject(ProjectsService); private toast = inject(ToastService);
  lista = signal<Project[]>([]); carregado = signal(false); aberto = signal(false); erro = signal('');
  f: Form = this.vazio();
  ngOnInit() { this.carregar(); }
  carregar() { this.api.list().subscribe({ next: l => { this.lista.set(l); this.carregado.set(true); }, error: e => this.toast.erro(e) }); }
  vazio(): Form { return { nome: '', descricao: '', dataEntrega: isoLocal(), status: 'pendente', etapas: [] }; }
  abrir(p?: Project) { this.f = p ? { id: p.id, nome: p.nome, descricao: p.descricao ?? '', dataEntrega: p.dataEntrega, status: p.status, etapas: p.etapas.map(e => ({ ...e })) } : this.vazio(); this.erro.set(''); this.aberto.set(true); }
  salvar() {
    if (!this.f.nome.trim()) { this.erro.set('Informe o nome do projeto.'); return; }
    const etapas = this.f.etapas.filter(e => e.titulo.trim()).map(e => ({ ...e, titulo: e.titulo.trim() }));
    const corpo = { nome: this.f.nome.trim(), descricao: this.f.descricao.trim() || null, dataEntrega: this.f.dataEntrega, status: this.f.status, etapas };
    (this.f.id ? this.api.update(this.f.id, corpo) : this.api.create(corpo)).subscribe({ next: () => { this.aberto.set(false); this.toast.ok('Projeto salvo!'); this.carregar(); }, error: e => this.toast.erro(e) });
  }
  marcar(p: Project, e: Step, ev: Event) {
    const alvo = ev.target as HTMLInputElement; const etapas = p.etapas.map(x => (x.id === e.id ? { ...x, concluida: alvo.checked } : x));
    this.api.update(p.id, { etapas }).subscribe({ next: r => { if (r.progresso === 100) { confete(alvo); this.toast.ok('Projeto 100% concluído! 🎉'); } this.carregar(); }, error: er => { this.toast.erro(er); this.carregar(); } });
  }
  excluir(p: Project) { if (!confirm(`Excluir o projeto "${p.nome}"?`)) return; this.api.remove(p.id).subscribe({ next: () => { this.toast.ok('Projeto excluído.'); this.carregar(); }, error: e => this.toast.erro(e) }); }
}
=======
import { Component } from '@angular/core';
import { MOCK_PROJECTS } from '../../mocks/mock-data';
import { BadgeComponent } from '../../shared/badge/badge.component';
import { ProgressBarComponent } from '../../shared/progress-bar/progress-bar.component';

@Component({
  selector: 'foco-projetos', standalone: true, imports: [DatePipe, BadgeComponent, ProgressBarComponent],
  template: `<div class="stack"><h1>Projetos</h1>
    @for (p of projetos; track p.id) {
      <article class="card stack"><div class="row-between"><h3>{{ p.nome }}</h3><foco-badge>{{ p.status.replace('_',' ') }}</foco-badge></div>
        <p class="muted">{{ p.descricao }} · entrega em {{ p.dataEntrega | date:'dd/MM/yyyy' }}</p>
        <foco-progress [value]="p.progresso" [label]="'Progresso de ' + p.nome" />
        <ul>@for (e of p.etapas; track e.id) { <li>{{ e.concluida ? '✓' : '○' }} {{ e.titulo }}</li> }</ul></article> }</div>`,
})
export class ProjetosComponent { projetos = MOCK_PROJECTS; }
>>>>>>> 12b45406a4e2c88ad2859f63e82f6d5ce74d09ca
