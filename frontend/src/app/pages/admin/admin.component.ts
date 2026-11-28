import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';
import { ToastService } from '../../core/ui/toast.service';
import { AdminResumo, AdminUsuario, Papel } from '../../models';
import { AdminService } from '../../services/foco.service';
import { BadgeComponent } from '../../shared/badge/badge.component';
import { IconComponent } from '../../shared/icon/icon.component';

/** Painel do administrador: números gerais e gerenciamento de usuários. */
@Component({
  selector: 'foco-admin', standalone: true, imports: [DatePipe, BadgeComponent, IconComponent],
  template: `<div class="stack"><div><h1>Painel do administrador</h1><p class="muted">Visão geral da plataforma e gerenciamento de contas.</p></div>
    @if (r(); as r) { <div class="grid">
      <div class="card stat"><b>{{ r.totalUsuarios }}</b><span class="muted">usuários ({{ r.totalAdmins }} admin)</span></div>
      <div class="card stat"><b>{{ r.totalTarefas }}</b><span class="muted">tarefas ({{ r.tarefasConcluidas }} concluídas)</span></div>
      <div class="card stat"><b>{{ r.totalDisciplinas }}</b><span class="muted">disciplinas</span></div>
      <div class="card stat"><b>{{ r.totalProjetos }}</b><span class="muted">projetos</span></div>
      <div class="card stat"><b>{{ r.totalTrilhas }}</b><span class="muted">trilhas</span></div>
      <div class="card stat"><b>{{ r.totalEventos }}</b><span class="muted">eventos</span></div></div> }
    <section class="card stack"><h3>Usuários</h3><div class="tabela-wrap"><table class="tabela">
      <thead><tr><th>Usuário</th><th>Papel</th><th>Tarefas</th><th>Disciplinas</th><th>Projetos</th><th>Desde</th><th></th></tr></thead>
      <tbody>@for (u of usuarios(); track u.id) { <tr>
        <td><div class="row" style="flex-wrap:nowrap"><span class="avatar">{{ u.nome.charAt(0).toUpperCase() }}</span><div><b>{{ u.nome }}</b><p class="muted">{{ u.email }}</p></div></div></td>
        <td><foco-badge [tone]="u.papel === 'admin' ? 'brand' : 'neutral'">{{ u.papel === 'admin' ? 'Admin' : 'Usuário' }}</foco-badge></td>
        <td>{{ u.totalTarefas }}</td><td>{{ u.totalDisciplinas }}</td><td>{{ u.totalProjetos }}</td><td class="muted">{{ u.criadoEm | date:'dd/MM/yyyy' }}</td>
        <td><div class="row" style="flex-wrap:nowrap;justify-content:flex-end">
          @if (u.id !== eu()?.id) {
            <button class="btn btn-secondary btn-sm" type="button" (click)="trocar(u)">{{ u.papel === 'admin' ? 'Tornar usuário' : 'Tornar admin' }}</button>
            <button class="btn btn-danger btn-icon btn-sm" type="button" (click)="excluir(u)" aria-label="Excluir usuário"><foco-icon name="trash" [size]="16" /></button>
          } @else { <span class="muted">você</span> }</div></td></tr> }</tbody></table></div></section></div>`,
})
export class AdminComponent implements OnInit {
  private api = inject(AdminService); private toast = inject(ToastService);
  eu = inject(AuthService).usuario;
  r = signal<AdminResumo | null>(null); usuarios = signal<AdminUsuario[]>([]);
  ngOnInit() { this.carregar(); }
  carregar() {
    this.api.resumo().subscribe({ next: v => this.r.set(v), error: e => this.toast.erro(e) });
    this.api.usuarios().subscribe({ next: v => this.usuarios.set(v), error: e => this.toast.erro(e) });
  }
  trocar(u: AdminUsuario) {
    const novo: Papel = u.papel === 'admin' ? 'usuario' : 'admin';
    this.api.papel(u.id, novo).subscribe({ next: () => { this.toast.ok('Permissão atualizada.'); this.carregar(); }, error: e => this.toast.erro(e) });
  }
  excluir(u: AdminUsuario) {
    if (!confirm(`Excluir ${u.nome} e TODOS os dados dessa conta? Isso não pode ser desfeito.`)) return;
    this.api.remover(u.id).subscribe({ next: () => { this.toast.ok('Usuário excluído.'); this.carregar(); }, error: e => this.toast.erro(e) });
  }
}
