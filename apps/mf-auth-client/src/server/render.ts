export const renderAuthHtml = (): string => `
<section>
  <h3>Auth Client Micro-Frontend (React Client)</h3>
  <div id="auth-react-root"></div>
</section>
<script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
<script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
<script src="https://unpkg.com/eventemitter3@5.0.1/umd/eventemitter3.min.js"></script>
<script>
(() => {
  const emitter = window.__COSMOS_EVENT_BUS__ ?? new EventEmitter3();
  window.__COSMOS_EVENT_BUS__ = emitter;

  const rootElement = document.getElementById('auth-react-root');
  if (!rootElement || !window.React || !window.ReactDOM) return;

  const { createElement, useEffect, useState } = window.React;
  const root = window.ReactDOM.createRoot(rootElement);

  const AuthApp = () => {
    const [status, setStatus] = useState('Waiting for Sign-In click event...');

    useEffect(() => {
      const onSignIn = (payload) => {
        setStatus('Sign-In event received from ' + payload.source + ' at ' + payload.happenedAt);
      };

      emitter.on('auth:signin-click', onSignIn);
      return () => {
        emitter.off('auth:signin-click', onSignIn);
      };
    }, []);

    return createElement('p', { id: 'auth-event-status' }, status);
  };

  root.render(createElement(AuthApp));
})();
</script>
`;
