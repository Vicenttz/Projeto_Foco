import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './core/theme/theme.service';
import { ToastService } from './core/ui/toast.service';
import { BackdropComponent } from './shared/backdrop/backdrop.component';

@Component({
  selector: 'app-root', standalone: true, imports: [RouterOutlet, BackdropComponent],
  template: `<foco-backdrop /><router-outlet />
    <div class="toasts" aria-live="polite">@for (t of toast.itens(); track t.id) { <div class="toast" [class.erro]="t.tipo === 'erro'">{{ t.texto }}</div> }</div>`,
})
export class AppComponent { private theme = inject(ThemeService); toast = inject(ToastService); }
