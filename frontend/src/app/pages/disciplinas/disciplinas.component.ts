<<<<<<< HEAD
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../core/ui/toast.service';
import { Discipline } from '../../models';
import { DisciplinesService } from '../../services/disciplines.service';
import { EmptyStateComponent } from '../../shared/empty-state/empty-state.component';
import { IconComponent } from '../../shared/icon/icon.component';
import { ModalComponent } from '../../shared/modal/modal.component';
import { ProgressBarComponent } from '../../shared/progress-bar/progress-bar.component';

@Component({
  selector: 'foco-disciplinas', standalone: true, imports: [FormsModule, IconComponent, ProgressBarComponent, ModalComponent, EmptyStateComponent],
  template: `<div class="stack"><div class="row-between"><h1>Disciplinas</h1>
    <button class="btn" type="button" (click)="abrir()"><foco-icon name="plus" />Nova disciplina</button></div>
    @if (lista().length) { <div class="grid">@for (d of lista(); track d.id) {
      <article class="card stack"><div class="cor-faixa" [style.background]="d.cor || null"></div>
        <h3>{{ d.nome }}</h3><p class="muted">{{ d.professor || 'Sem professor informado' }}</p>
        <foco-progress [value]="d.progresso" [label]="'Progresso em ' + d.nome" />
        <div class="row"><button class="btn btn-secondary btn-sm" type="button" (click)="abrir(d)"><foco-icon name="edit" [size]="16" />Editar</button>
          <button class="btn btn-danger btn-sm" type="button" (click)="excluir(d)"><foco-icon name="trash" [size]="16" />Excluir</button></div></article> }</div> }
    @else if (carregado()) { <foco-empty-state title="Nenhuma disciplina ainda" message="Cadastre as matérias que você está cursando."><button class="btn" type="button" (click)="abrir()">Nova disciplina</button></foco-empty-state> }
    @if (aberto()) { <foco-modal [titulo]="f.id ? 'Editar disciplina' : 'Nova disciplina'" (fechar)="aberto.set(false)">
      <div class="stack"><div class="field"><label for="n">Nome</label><input id="n" [(ngModel)]="f.nome" /></div>
        <div class="field"><label for="p">Professor</label><input id="p" [(ngModel)]="f.professor" /></div>
        <div class="field"><label for="c">Cor</label><input id="c" type="color" [(ngModel)]="f.cor" /></div>
        @if (erro()) { <p class="erro">{{ erro() }}</p> }
        <div class="modal-acoes"><button class="btn btn-secondary" type="button" (click)="aberto.set(false)">Cancelar</button><button class="btn" type="button" (click)="salvar()">Salvar</button></div></div></foco-modal> }</div>`,
})
export class DisciplinasComponent implements OnInit {
  private api = inject(DisciplinesService); private toast = inject(ToastService);
  lista = signal<Discipline[]>([]); carregado = signal(false); aberto = signal(false); erro = signal('');
  f: { id?: number; nome: string; professor: string; cor: string } = { nome: '', professor: '', cor: '#8746eb' };

  ngOnInit() { this.carregar(); }
  carregar() { this.api.list().subscribe({ next: l => { this.lista.set(l); this.carregado.set(true); }, error: e => this.toast.erro(e) }); }
  abrir(d?: Discipline) { this.f = d ? { id: d.id, nome: d.nome, professor: d.professor ?? '', cor: d.cor || '#8746eb' } : { nome: '', professor: '', cor: '#8746eb' }; this.erro.set(''); this.aberto.set(true); }
  salvar() {
    if (!this.f.nome.trim()) { this.erro.set('Informe o nome da disciplina.'); return; }
    const corpo = { nome: this.f.nome.trim(), professor: this.f.professor.trim() || null, cor: this.f.cor };
    const req = this.f.id ? this.api.update(this.f.id, corpo) : this.api.create(corpo);
    req.subscribe({ next: () => { this.aberto.set(false); this.toast.ok('Disciplina salva!'); this.carregar(); }, error: e => this.toast.erro(e) });
  }
  excluir(d: Discipline) {
    if (!confirm(`Excluir "${d.nome}"? As tarefas dela não serão apagadas.`)) return;
    this.api.remove(d.id).subscribe({ next: () => { this.toast.ok('Disciplina excluída.'); this.carregar(); }, error: e => this.toast.erro(e) });
  }
}
=======
import { Component } from '@angular/core';
import { MOCK_DISCIPLINES } from '../../mocks/mock-data';
import { IconComponent } from '../../shared/icon/icon.component';
import { ProgressBarComponent } from '../../shared/progress-bar/progress-bar.component';

@Component({
  selector: 'foco-disciplinas', standalone: true, imports: [IconComponent, ProgressBarComponent],
  template: `<div class="stack"><div class="row-between"><h1>Disciplinas</h1>
    <button class="btn"><foco-icon name="plus" />Nova disciplina</button></div>
    <div class="grid">@for (d of disciplinas; track d.id) {
      <article class="card stack"><h3>{{ d.nome }}</h3><p class="muted">{{ d.professor }}</p><foco-progress [value]="d.progresso" [label]="'Progresso em ' + d.nome" />
        <button class="btn btn-secondary">Ver detalhes</button></article> }</div></div>`,
})
export class DisciplinasComponent { disciplinas = MOCK_DISCIPLINES; }
>>>>>>> 12b45406a4e2c88ad2859f63e82f6d5ce74d09ca
