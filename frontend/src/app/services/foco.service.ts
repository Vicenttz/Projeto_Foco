import { Injectable, inject } from '@angular/core';
import { ApiService } from '../core/http/api.service';
import { AdminResumo, AdminUsuario, Dashboard, FocoInfo, Papel } from '../models';

@Injectable({ providedIn: 'root' })
export class FocoService {
  private api = inject(ApiService);
  obter() { return this.api.get<FocoInfo>('/foco'); }
  definir(tarefaId: number) { return this.api.put<FocoInfo>(`/foco/${tarefaId}`, {}); }
  limpar() { return this.api.delete<void>('/foco'); }
  dashboard() { return this.api.get<Dashboard>('/dashboard'); }
  mensagem(texto: string) { return this.api.post<{ texto: string }>('/assistente/mensagem', { texto }); }
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private api = inject(ApiService);
  resumo() { return this.api.get<AdminResumo>('/admin/resumo'); }
  usuarios() { return this.api.get<AdminUsuario[]>('/admin/usuarios'); }
  papel(id: number, papel: Papel) { return this.api.put<AdminUsuario>(`/admin/usuarios/${id}`, { papel }); }
  remover(id: number) { return this.api.delete<void>(`/admin/usuarios/${id}`); }
}
