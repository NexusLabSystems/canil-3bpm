if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.error('Falha ao registrar service worker', err);
    });
  });

  window.addEventListener('online', () => {
    import('./lib/offline-queue').then(({ sincronizarFila }) => sincronizarFila());
  });
}
