import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ToastService } from '../../core/ui/toast.service';
import { Discipline, Trail } from '../../models';
import { DisciplinesService } from '../../services/disciplines.service';
import { TrailsService } from '../../services/trails.service';
import { EmptyStateComponent } from '../../shared/empty-state/empty-state.component';
import { IconComponent } from '../../shared/icon/icon.component';
import { ModalComponent } from '../../shared/modal/modal.component';
import { ProgressBarComponent } from '../../shared/progress-bar/progress-bar.component';

interface Form { id?: number; nome: string; professor: string; cor: string; descricao: string; trilhaIds: number[]; }
const COR_PADRAO = '#8746eb';

/**
 * Disciplinas: além de nome/professor/cor, cada disciplina tem descrição e pode (opcionalmente) ser ligada a
 * trilhas de aprendizagem. Com trilhas ligadas, a porcentagem da disciplina sobe a cada etapa concluída nelas;
 * sem trilhas, ela segue as tarefas concluídas.
 */
@Component({
  selector: 'foco-disciplinas', standalone: true, imports: [FormsModule, RouterLink, IconComponent, ProgressBarComponent, ModalComponent, EmptyStateComponent],
  template: `<div class="stack"><div class="row-between"><h1>Disciplinas</h1>
    <button class="btn" type="button" (click)="abrir()"><foco-icon name="plus" />Nova disciplina</button></div>
    @if (lista().length) { <div class="grid">@for (d of lista(); track d.id) {
      <article class="card stack"><div class="cor-faixa" [style.background]="d.cor || null"></div>
        <h3>{{ d.nome }}</h3><p class="muted">{{ d.professor || 'Sem professor informado' }}</p>
        @if (d.descricao) { <p class="desc">{{ d.descricao }}</p> }
        <foco-progress [value]="d.progresso" [label]="'Progresso em ' + d.nome" />
        <p class="muted">{{ origem(d) }}</p>
        <div class="trilhas">
          <span class="muted"><b>Trilhas de estudo</b></span>
          @for (t of d.trilhas ?? []; track t.id) {
            <a class="trilha-item" routerLink="/trilhas" [title]="'Abrir trilhas: ' + t.assunto"><span>{{ t.assunto }}</span><b>{{ t.progresso }}%</b></a>
          } @empty { <span class="muted">Nenhuma trilha vinculada (opcional).</span> }
        </div>
        <div class="row"><button class="btn btn-secondary btn-sm" type="button" (click)="abrir(d)"><foco-icon name="edit" [size]="16" />Editar</button>
          <button class="btn btn-danger btn-sm" type="button" (click)="excluir(d)"><foco-icon name="trash" [size]="16" />Excluir</button></div></article> }</div> }
    @else if (carregado()) { <foco-empty-state title="Nenhuma disciplina ainda" message="Cadastre as matérias que você está cursando."><button class="btn" type="button" (click)="abrir()">Nova disciplina</button></foco-empty-state> }
    @if (aberto()) { <foco-modal [titulo]="f.id ? 'Editar disciplina' : 'Nova disciplina'" (fechar)="aberto.set(false)">
      <div class="stack"><div class="field"><label for="n">Nome</label><input id="n" [(ngModel)]="f.nome" /></div>
        <div class="field"><label for="p">Professor</label><input id="p" [(ngModel)]="f.professor" /></div>
        <div class="field"><label for="ds">Descrição</label><textarea id="ds" rows="3" maxlength="2000" placeholder="Ementa, objetivos, observações…" [(ngModel)]="f.descricao"></textarea></div>
        <div class="field"><label for="c">Cor</label><input id="c" type="color" [(ngModel)]="f.cor" /></div>
        <fieldset class="field escolha"><legend>Trilhas de aprendizagem <span class="muted">(opcional)</span></legend>
          <p class="muted">Ao concluir as etapas das trilhas escolhidas, a porcentagem da disciplina aumenta.</p>
          @for (t of trilhas(); track t.id) {
            <label class="opcao"><input type="checkbox" [checked]="f.trilhaIds.includes(t.id)" (change)="alternarTrilha(t.id)" />
              <span>{{ t.assunto }} <span class="muted">· {{ t.progresso }}%{{ outraDisciplina(t) ? ' · hoje em "' + outraDisciplina(t) + '"' : '' }}</span></span></label>
          } @empty { <p class="muted">Você ainda não tem trilhas. <a routerLink="/trilhas" (click)="aberto.set(false)">Criar uma trilha</a></p> }
        </fieldset>
        @if (erro()) { <p class="erro">{{ erro() }}</p> }
        <div class="modal-acoes"><button class="btn btn-secondary" type="button" (click)="aberto.set(false)">Cancelar</button><button class="btn" type="button" (click)="salvar()">Salvar</button></div></div></foco-modal> }</div>`,
  styles: [`
    .desc { margin: 0; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
    .trilhas { display: flex; flex-direction: column; gap: .4rem; }
    .trilha-item { display: flex; justify-content: space-between; gap: .75rem; padding: .45rem .7rem; border-radius: var(--radius-md); text-decoration: none; color: var(--color-text);
      border: 1px solid var(--color-border); background: color-mix(in srgb, var(--color-primary) 6%, transparent); transition: border-color .15s; }
    .trilha-item:hover { border-color: var(--color-primary); }
    .trilha-item b { color: var(--color-primary); }
    .escolha { border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: .75rem; margin: 0; max-height: 220px; overflow: auto; }
    .escolha legend { font-weight: var(--fw-medium); font-size: var(--fs-small); padding: 0 .35rem; }
    .opcao { display: flex; align-items: flex-start; gap: .55rem; padding: .3rem 0; cursor: pointer; font-weight: var(--fw-regular, 400); }
    .opcao input { margin-top: .2rem; accent-color: var(--color-primary); }
  `],
})
export class DisciplinasComponent implements OnInit {
  private api = inject(DisciplinesService); private trails = inject(TrailsService); private toast = inject(ToastService);
  lista = signal<Discipline[]>([]); trilhas = signal<Trail[]>([]); carregado = signal(false); aberto = signal(false); erro = signal('');
  f: Form = this.vazio();

  ngOnInit() { this.carregar(); }
  carregar() {
    this.api.list().subscribe({ next: l => { this.lista.set(l); this.carregado.set(true); }, error: e => this.toast.erro(e) });
    this.trails.list().subscribe({ next: t => this.trilhas.set(t), error: e => this.toast.erro(e) });
  }
  private vazio(): Form { return { nome: '', professor: '', cor: COR_PADRAO, descricao: '', trilhaIds: [] }; }

  /** Explica de onde vem a porcentagem. */
  origem(d: Discipline): string {
    if (d.totalEtapas) return `${d.etapasConcluidas} de ${d.totalEtapas} etapas das trilhas concluídas`;
    if (d.totalTarefas) return `${d.tarefasConcluidas} de ${d.totalTarefas} tarefas concluídas`;
    return 'Vincule uma trilha ou crie tarefas para acompanhar o progresso.';
  }
  /** Nome da outra disciplina que já usa a trilha (ao escolhê-la aqui, ela muda para esta). */
  outraDisciplina(t: Trail): string {
    if (t.disciplinaId == null || t.disciplinaId === this.f.id) return '';
    return this.lista().find(d => d.id === t.disciplinaId)?.nome ?? '';
  }
  alternarTrilha(id: number) {
    this.f.trilhaIds = this.f.trilhaIds.includes(id) ? this.f.trilhaIds.filter(x => x !== id) : [...this.f.trilhaIds, id];
  }
  abrir(d?: Discipline) {
    this.f = d ? { id: d.id, nome: d.nome, professor: d.professor ?? '', cor: d.cor || COR_PADRAO, descricao: d.descricao ?? '', trilhaIds: (d.trilhas ?? []).map(t => t.id) } : this.vazio();
    this.erro.set(''); this.aberto.set(true);
  }
  salvar() {
    if (!this.f.nome.trim()) { this.erro.set('Informe o nome da disciplina.'); return; }
    const corpo = { nome: this.f.nome.trim(), professor: this.f.professor.trim() || null, cor: this.f.cor, descricao: this.f.descricao.trim() || null, trilhaIds: this.f.trilhaIds };
    const req = this.f.id ? this.api.update(this.f.id, corpo) : this.api.create(corpo);
    req.subscribe({ next: () => { this.aberto.set(false); this.toast.ok('Disciplina salva!'); this.carregar(); }, error: e => this.toast.erro(e) });
  }
  excluir(d: Discipline) {
    if (!confirm(`Excluir "${d.nome}"? As tarefas e trilhas dela não serão apagadas.`)) return;
    this.api.remove(d.id).subscribe({ next: () => { this.toast.ok('Disciplina excluída.'); this.carregar(); }, error: e => this.toast.erro(e) });
  }
}
