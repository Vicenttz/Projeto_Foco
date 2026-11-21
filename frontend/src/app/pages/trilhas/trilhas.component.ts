<<<<<<< HEAD
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../core/ui/toast.service';
import { confete } from '../../core/ui/confetti';
import { Step, Trail } from '../../models';
import { TrailsService } from '../../services/trails.service';
import { EmptyStateComponent } from '../../shared/empty-state/empty-state.component';
import { IconComponent } from '../../shared/icon/icon.component';
import { ModalComponent } from '../../shared/modal/modal.component';
import { ProgressBarComponent } from '../../shared/progress-bar/progress-bar.component';
import { StepsEditorComponent } from '../../shared/steps-editor/steps-editor.component';

@Component({
  selector: 'foco-trilhas', standalone: true, imports: [FormsModule, ProgressBarComponent, IconComponent, ModalComponent, EmptyStateComponent, StepsEditorComponent],
  template: `<div class="stack"><div class="row-between"><h1>Trilhas de aprendizagem</h1><button class="btn" type="button" (click)="abrir()"><foco-icon name="plus" />Nova trilha</button></div>
    @for (t of lista(); track t.id) {
      <article class="card stack lift"><h3>{{ t.assunto }}</h3><foco-progress [value]="t.progresso" [label]="t.assunto" />
        <ol class="steps">@for (e of t.etapas; track e.id) { <li [class.done]="e.concluida"><label class="row" style="cursor:pointer;flex-wrap:nowrap"><input type="checkbox" [checked]="e.concluida" (change)="marcar(t, e, $event)" />{{ e.titulo }}</label></li> }</ol>
        <div class="row"><button class="btn btn-secondary btn-sm" type="button" (click)="abrir(t)"><foco-icon name="edit" [size]="16" />Editar</button>
          <button class="btn btn-danger btn-sm" type="button" (click)="excluir(t)"><foco-icon name="trash" [size]="16" />Excluir</button></div></article>
    } @empty { @if (carregado()) { <foco-empty-state title="Nenhuma trilha" message="Monte um caminho de estudo passo a passo."><button class="btn" type="button" (click)="abrir()">Nova trilha</button></foco-empty-state> } }
    @if (aberto()) { <foco-modal [titulo]="f.id ? 'Editar trilha' : 'Nova trilha'" (fechar)="aberto.set(false)"><div class="stack">
      <div class="field"><label for="a">Assunto</label><input id="a" [(ngModel)]="f.assunto" /></div>
      <h3>Etapas</h3><foco-steps-editor [etapas]="f.etapas" />
      @if (erro()) { <p class="erro">{{ erro() }}</p> }
      <div class="modal-acoes"><button class="btn btn-secondary" type="button" (click)="aberto.set(false)">Cancelar</button><button class="btn" type="button" (click)="salvar()">Salvar</button></div></div></foco-modal> }</div>`,
  styles: ['.steps{list-style:none;padding:0 0 0 1.1rem;margin:0;display:flex;flex-direction:column;gap:.8rem;border-left:3px solid var(--color-primary-soft)}.done{color:var(--color-success)}.done label{text-decoration:line-through;opacity:.8}'],
})
export class TrilhasComponent implements OnInit {
  private api = inject(TrailsService); private toast = inject(ToastService);
  lista = signal<Trail[]>([]); carregado = signal(false); aberto = signal(false); erro = signal('');
  f: { id?: number; assunto: string; etapas: Step[] } = { assunto: '', etapas: [] };
  ngOnInit() { this.carregar(); }
  carregar() { this.api.list().subscribe({ next: l => { this.lista.set(l); this.carregado.set(true); }, error: e => this.toast.erro(e) }); }
  abrir(t?: Trail) { this.f = t ? { id: t.id, assunto: t.assunto, etapas: t.etapas.map(e => ({ ...e })) } : { assunto: '', etapas: [] }; this.erro.set(''); this.aberto.set(true); }
  salvar() {
    if (!this.f.assunto.trim()) { this.erro.set('Informe o assunto da trilha.'); return; }
    const corpo = { assunto: this.f.assunto.trim(), etapas: this.f.etapas.filter(e => e.titulo.trim()).map(e => ({ ...e, titulo: e.titulo.trim() })) };
    (this.f.id ? this.api.update(this.f.id, corpo) : this.api.create(corpo)).subscribe({ next: () => { this.aberto.set(false); this.toast.ok('Trilha salva!'); this.carregar(); }, error: e => this.toast.erro(e) });
  }
  marcar(t: Trail, e: Step, ev: Event) {
    const alvo = ev.target as HTMLInputElement; const etapas = t.etapas.map(x => (x.id === e.id ? { ...x, concluida: alvo.checked } : x));
    this.api.update(t.id, { etapas }).subscribe({ next: r => { if (r.progresso === 100) { confete(alvo); this.toast.ok('Trilha concluída! 🎉'); } this.carregar(); }, error: er => { this.toast.erro(er); this.carregar(); } });
  }
  excluir(t: Trail) { if (!confirm(`Excluir a trilha "${t.assunto}"?`)) return; this.api.remove(t.id).subscribe({ next: () => { this.toast.ok('Trilha excluída.'); this.carregar(); }, error: e => this.toast.erro(e) }); }
}
=======
import { Component } from '@angular/core';
import { MOCK_TRAILS } from '../../mocks/mock-data';
import { ProgressBarComponent } from '../../shared/progress-bar/progress-bar.component';

@Component({
  selector: 'foco-trilhas', standalone: true, imports: [ProgressBarComponent],
  template: `<div class="stack"><h1>Trilhas de aprendizagem</h1>
    @for (t of trilhas; track t.id) {
      <article class="card stack"><h3>{{ t.assunto }}</h3><foco-progress [value]="t.progresso" [label]="t.assunto" />
        <ol class="steps">@for (e of t.etapas; track e.id) { <li [class.done]="e.concluida">{{ e.titulo }}</li> }</ol></article> }</div>`,
  styles: ['.steps{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:.75rem;border-left:2px solid var(--color-primary-soft);padding-left:1rem}.done{color:var(--color-success)}'],
})
export class TrilhasComponent { trilhas = MOCK_TRAILS; }
>>>>>>> 12b45406a4e2c88ad2859f63e82f6d5ce74d09ca
