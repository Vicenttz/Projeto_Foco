import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BriefingSugestao } from '../../models';
import { BriefingService } from '../../services/briefing.service';
import { ModalComponent } from '../modal/modal.component';

/** Mensagem do dia do assistente. Aparece na primeira entrada do dia e pelo botão do topo. */
@Component({
  selector: 'foco-briefing',
  standalone: true,
  imports: [ModalComponent],
  template: `
    @if (b.aberto()) {
      @if (b.atual(); as d) {
        <foco-modal [titulo]="d.saudacao" (fechar)="b.fechar()">
          <div class="stack">
            <p class="texto">{{ d.texto }}</p>
            @if (d.hoje.length) {
              <div class="stack lista"><h3>Hoje</h3>
                @for (e of d.hoje; track e.id) {
                  <div class="linha"><span class="pt" [class]="'t-' + e.tipo"></span><span class="hora">{{ e.hora || 'Dia todo' }}</span><b>{{ e.titulo }}</b></div>
                }
              </div>
            }
            @if (d.proximos.length) {
              <div class="stack lista"><h3>Em breve</h3>
                @for (e of d.proximos; track e.id) {
                  <div class="linha"><span class="pt" [class]="'t-' + e.tipo"></span><span class="hora">{{ e.quando }}</span><b>{{ e.titulo }}</b></div>
                }
              </div>
            }
            @if (d.sugestoes.length) {
              <div class="stack lista"><h3>Sugestões</h3>
                <div class="row">@for (s of d.sugestoes; track s.texto) { <button class="chip" type="button" (click)="aplicar(s)">{{ s.texto }}</button> }</div>
                <p class="muted">São só sugestões do assistente: você decide o que fazer.</p>
              </div>
            }
            @if (d.geradoPor === 'gemini') { <p class="muted">Texto gerado pela IA a partir da sua agenda.</p> }
            <div class="modal-acoes">
              <button class="btn btn-secondary" type="button" (click)="b.recarregar()">Atualizar</button>
              <button class="btn btn-secondary" type="button" (click)="abrirCalendario()">Ver calendário</button>
              <button class="btn" type="button" (click)="b.fechar()">Entendi</button>
            </div>
          </div>
        </foco-modal>
      }
    }`,
  styles: [`
    .texto { white-space: pre-line; line-height: 1.55; }
    .lista { gap: .4rem; }
    .linha { display: flex; align-items: center; gap: .55rem; }
    .hora { min-width: 4.8rem; color: var(--color-text-muted); font-size: var(--fs-small); }
    .pt { width: .65rem; height: .65rem; border-radius: 50%; background: var(--cor, var(--color-primary)); flex: none; }
    .t-prova { --cor: var(--color-red); } .t-estudo { --cor: var(--color-green); } .t-entrega { --cor: var(--color-orange); }
    .t-tarefa { --cor: var(--color-blue); } .t-evento { --cor: var(--color-primary); }
  `],
})
export class BriefingComponent {
  b = inject(BriefingService);
  private router = inject(Router);

  aplicar(s: BriefingSugestao): void {
    this.b.fechar();
    if (s.rota) this.router.navigate([s.rota], { queryParams: s.query ?? {} });
  }
  abrirCalendario(): void { this.b.fechar(); this.router.navigate(['/calendario']); }
}
