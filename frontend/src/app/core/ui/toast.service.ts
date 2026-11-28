import { Injectable, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

export interface Toast { id: number; texto: string; tipo: 'ok' | 'erro'; }

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly itens = signal<Toast[]>([]);
  private n = 0;
  ok(texto: string) { this.add(texto, 'ok'); }
  erro(e: unknown, padrao = 'Algo deu errado.') {
    const h = e as HttpErrorResponse;
    const msg = h?.status === 0 ? 'Não foi possível conectar ao servidor.' : (typeof h?.error?.detail === 'string' ? h.error.detail : padrao);
    this.add(msg, 'erro');
  }
  private add(texto: string, tipo: Toast['tipo']) {
    const id = ++this.n; this.itens.update(l => [...l, { id, texto, tipo }]);
    setTimeout(() => this.itens.update(l => l.filter(t => t.id !== id)), 3800);
  }
}
