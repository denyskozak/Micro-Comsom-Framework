export const renderHeaderHtml = (): string => `
<section>
  <h2>Header Micro-Frontend (SSR)</h2>
  <button id="cosmos-signin-btn" type="button">Sign-In</button>
</section>
<script src="https://unpkg.com/eventemitter3@5.0.1/umd/eventemitter3.min.js"></script>
<script>
(() => {
  const emitter = window.__COSMOS_EVENT_BUS__ ?? new EventEmitter3();
  window.__COSMOS_EVENT_BUS__ = emitter;

  const signInButton = document.getElementById('cosmos-signin-btn');
  if (!signInButton) return;

  signInButton.addEventListener('click', () => {
    emitter.emit('auth:signin-click', {
      source: 'header-mf',
      happenedAt: new Date().toISOString()
    });
  });
})();
</script>
`;
