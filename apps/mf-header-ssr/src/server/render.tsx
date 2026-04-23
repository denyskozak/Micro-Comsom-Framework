import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import { HeaderRoutes } from '../app/header-routes';

export const renderHeaderHtml = (route: string): string => {
  const appHtml = renderToString(
    <StaticRouter location={route}>
      <HeaderRoutes />
    </StaticRouter>
  );

  return `${appHtml}
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
</script>`;
};
