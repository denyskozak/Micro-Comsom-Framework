import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import { FooterRoutes } from '../app/footer-routes';

export const renderFooterHtml = (route: string): string => {
  return renderToString(
    <StaticRouter location={route}>
      <FooterRoutes />
    </StaticRouter>
  );
};
