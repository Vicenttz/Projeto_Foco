/** Chuva de confete para celebrar uma tarefa concluída (puro DOM/CSS, sem biblioteca). */
export function confete(origem?: HTMLElement | null): void {
  const r = origem?.getBoundingClientRect();
  const x = r ? r.left + r.width / 2 : window.innerWidth / 2, y = r ? r.top + r.height / 2 : window.innerHeight / 3;
  for (let i = 0; i < 34; i++) {
    const e = document.createElement('span'); e.className = 'confete';
    const ang = Math.random() * Math.PI * 2, dist = 60 + Math.random() * 150;
    e.style.cssText = `left:${x}px;top:${y}px;--dx:${Math.cos(ang) * dist}px;--dy:${Math.sin(ang) * dist - 60}px;--rot:${Math.random() * 720 - 360}deg;` +
      `background:${i % 3 === 0 ? 'var(--color-primary)' : i % 3 === 1 ? 'var(--color-accent)' : 'var(--color-orange)'}`;
    document.body.appendChild(e); setTimeout(() => e.remove(), 1300);
  }
}
