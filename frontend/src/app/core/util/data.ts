/** Data local no formato AAAA-MM-DD (toISOString() usaria UTC e erraria o dia à noite no Brasil). */
export const isoLocal = (d: Date = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
