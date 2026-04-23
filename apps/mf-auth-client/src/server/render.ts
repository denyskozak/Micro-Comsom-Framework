export const renderAuthHtml = (): string => `
<section>
  <h3>Auth Client Micro-Frontend</h3>
  <p id="auth-event-status">Waiting for Sign-In click event...</p>
</section>
<script src="https://unpkg.com/eventemitter3@5.0.1/umd/eventemitter3.min.js"></script>
<script>
(() => {
  const emitter = window.__COSMOS_EVENT_BUS__ ?? new EventEmitter3();
  window.__COSMOS_EVENT_BUS__ = emitter;

  const statusNode = document.getElementById('auth-event-status');
  if (!statusNode) return;

  emitter.on('auth:signin-click', (payload) => {
    statusNode.textContent = 'Sign-In event received from ' + payload.source + ' at ' + payload.happenedAt;
  });
})();
</script>
`;
