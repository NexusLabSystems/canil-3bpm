if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  // O cache-first do SW conflita com o hot-reload do Next em dev (serve
  // versões antigas da página e entra em loop de reload com o Turbopack).
  // Só registra em produção.
  if (process.env.NODE_ENV === 'production') {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.error('Falha ao registrar service worker', err);
      });
    });
  } else {
    navigator.serviceWorker.getRegistrations().then((regs) => {
      regs.forEach((reg) => reg.unregister());
    });
  }

  window.addEventListener('online', () => {
    import('./lib/offline-queue').then(({ sincronizarFila }) => sincronizarFila());
  });
}
