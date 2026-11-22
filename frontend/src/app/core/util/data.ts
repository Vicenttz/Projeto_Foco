/** Data local no formato AAAA-MM-DD (toISOString() usaria UTC e erraria o dia à noite no Brasil). */
export const isoLocal = (d: Date = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** Converte AAAA-MM-DD em Date local (meia-noite), sem o deslocamento de fuso do `new Date('AAAA-MM-DD')`. */
export const paraData = (iso: string): Date => {
  const [a, m, d] = iso.split('-').map(Number);
  return new Date(a, m - 1, d);
};
/** Dias entre hoje e a data (0 = hoje, 1 = amanhã, negativo = passou). */
export const diasAte = (iso: string, base: Date = new Date()): number =>
  Math.round((paraData(iso).getTime() - new Date(base.getFullYear(), base.getMonth(), base.getDate()).getTime()) / 86_400_000);
export const dataValida = (iso: string | null | undefined): iso is string => !!iso && /^\d{4}-\d{2}-\d{2}$/.test(iso);

export const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
export const SEMANA_CURTA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
export const SEMANA_LONGA = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
