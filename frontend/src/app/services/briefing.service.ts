import { Injectable, inject, signal } from '@angular/core';
import { Observable, of, tap } from 'rxjs';
import { AuthService } from '../core/auth/auth.service';
import { ApiService } from '../core/http/api.service';
import { ToastService } from '../core/ui/toast.service';
import { isoLocal } from '../core/util/data';
import { Briefing } from '../models';

/**
 * Mensagem do dia do assistente (lê a agenda e resume o que importa hoje).
 * - Aparece sozinha na primeira entrada do dia; o botão do topo reabre quando quiser.
 * - O texto do dia fica guardado no navegador (não muda a cada recarga). Quando o calendário muda,
 *   o calendário chama invalidar() para a próxima abertura já refletir a agenda nova.
 */
@Injectable({ providedIn: 'root' })
export class BriefingService {
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private toast = inject(ToastService);

  readonly atual = signal<Briefing | null>(null);
  readonly aberto = signal(false);

  /** Chamado ao entrar no app: abre a mensagem se ainda não foi vista hoje. */
  entrar(): void {
    const u = this.auth.usuario();
    if (!u) return;
    const hoje = isoLocal();
    const chaveVisto = `foco_diario_visto_${u.id}`;
    if (this.ler(chaveVisto) === hoje) return;
    this.carregar().subscribe({
      next: () => { this.guardar(chaveVisto, hoje); this.aberto.set(true); },
      error: () => { /* sem rede/API: tenta de novo na próxima entrada */ },
    });
  }

  abrir(): void {
    this.carregar().subscribe({ next: () => this.aberto.set(true), error: e => this.toast.erro(e) });
  }
  fechar(): void { this.aberto.set(false); }
  recarregar(): void { this.carregar(true).subscribe({ error: e => this.toast.erro(e) }); }

  carregar(forcar = false): Observable<Briefing> {
    const u = this.auth.usuario();
    const hoje = isoLocal();
    const chave = u ? `foco_diario_${u.id}_${hoje}` : null;
    if (!forcar && chave) {
      const salvo = this.ler(chave);
      if (salvo) { try { const b = JSON.parse(salvo) as Briefing; this.atual.set(b); return of(b); } catch { /* cache inválido: busca de novo */ } }
    }
    return this.api.get<Briefing>(`/assistente/diario?data=${hoje}&hora=${new Date().getHours()}`).pipe(
      tap(b => { this.atual.set(b); if (chave) this.guardar(chave, JSON.stringify(b)); }),
    );
  }

  /** Descarta o texto guardado de hoje (use depois de criar/editar/excluir compromissos). */
  invalidar(): void {
    const u = this.auth.usuario();
    if (!u) return;
    try { localStorage.removeItem(`foco_diario_${u.id}_${isoLocal()}`); } catch { /* ignorar */ }
  }

  private ler(chave: string): string | null { try { return localStorage.getItem(chave); } catch { return null; } }
  private guardar(chave: string, valor: string): void { try { localStorage.setItem(chave, valor); } catch { /* ignorar */ } }
}
