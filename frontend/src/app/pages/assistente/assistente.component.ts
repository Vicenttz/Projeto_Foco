<<<<<<< HEAD
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../core/ui/toast.service';
import { ChatMessage } from '../../models';
import { FocoService } from '../../services/foco.service';
import { IconComponent } from '../../shared/icon/icon.component';

/** Chat com o assistente (POST /assistente/mensagem). A IA apenas sugere: o estudante decide. */
@Component({
  selector: 'foco-assistente', standalone: true, imports: [FormsModule, IconComponent],
  template: `<div class="stack"><h1>Assistente de IA</h1>
    <div class="row">@for (s of sugestoes; track s) { <button class="chip" type="button" (click)="enviar(s)">{{ s }}</button> }</div>
    <div class="card chat" aria-live="polite">
      @for (m of mensagens(); track $index) { <div class="msg" [class.user]="m.autor === 'usuario'">{{ m.texto }}</div> }
      @if (digitando()) { <div class="msg">…</div> }</div>
    <div class="row" style="flex-wrap:nowrap"><input class="grow" aria-label="Mensagem" placeholder="Pergunte algo ao assistente" [(ngModel)]="texto" (keyup.enter)="enviar(texto)" />
      <button class="btn" type="button" (click)="enviar(texto)" [disabled]="digitando()"><foco-icon name="send" [size]="18" />Enviar</button></div></div>`,
})
export class AssistenteComponent {
  private api = inject(FocoService); private toast = inject(ToastService);
  texto = ''; digitando = signal(false);
  sugestoes = ['Sugerir tarefas para a semana', 'Reorganizar prioridades', 'Montar calendário de estudos'];
  mensagens = signal<ChatMessage[]>([{ autor: 'assistente', texto: 'Olá! Posso sugerir tarefas e prioridades. Você decide o que aceitar.' }]);
  enviar(t: string) {
    if (!t.trim() || this.digitando()) return;
    this.mensagens.update(m => [...m, { autor: 'usuario', texto: t }]); this.texto = ''; this.digitando.set(true);
    this.api.mensagem(t).subscribe({
      next: r => { this.digitando.set(false); this.mensagens.update(m => [...m, { autor: 'assistente', texto: r.texto }]); },
      error: e => { this.digitando.set(false); this.toast.erro(e); },
    });
=======
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChatMessage } from '../../models';

/** Interface de chat. A resposta abaixo é MOCK; a integração com a Gemini será feita pelo Richard.
 *  A IA apenas sugere: o estudante aceita, edita ou ignora. */
@Component({
  selector: 'foco-assistente', standalone: true, imports: [FormsModule],
  template: `<div class="stack"><h1>Assistente de IA</h1>
    <div class="row">@for (s of sugestoes; track s) { <button class="btn btn-secondary" (click)="enviar(s)">{{ s }}</button> }</div>
    <div class="card chat" aria-live="polite">
      @for (m of mensagens(); track $index) { <div class="msg" [class.user]="m.autor === 'usuario'">{{ m.texto }}</div> }</div>
    <div class="row"><div class="field" style="flex:1"><label for="msg" class="sr">Mensagem</label>
      <input id="msg" placeholder="Pergunte algo ao assistente" [(ngModel)]="texto" (keyup.enter)="enviar(texto)" /></div>
      <button class="btn" (click)="enviar(texto)">Enviar</button></div></div>`,
  styles: ['.chat{min-height:280px;display:flex;flex-direction:column;gap:.5rem}.msg{padding:.6rem .9rem;border-radius:var(--radius-md);background:var(--color-bg);max-width:80%}.msg.user{align-self:flex-end;background:var(--color-primary);color:var(--color-on-primary)}.sr{position:absolute;left:-9999px}'],
})
export class AssistenteComponent {
  texto = '';
  sugestoes = ['Sugerir tarefas para a semana', 'Reorganizar prioridades', 'Montar calendário de estudos'];
  mensagens = signal<ChatMessage[]>([{ autor: 'assistente', texto: 'Olá! Posso sugerir tarefas e prioridades. Você decide o que aceitar.' }]);
  enviar(t: string) {
    if (!t.trim()) return;
    this.mensagens.update(m => [...m, { autor: 'usuario', texto: t }, { autor: 'assistente', texto: '(mock) Integração com a Gemini ainda não implementada.' }]);
    this.texto = '';
>>>>>>> 12b45406a4e2c88ad2859f63e82f6d5ce74d09ca
  }
}
