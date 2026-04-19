import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import { CatalogRoutes } from '../app/catalog-routes';

export const renderCatalogHtml = (route: string): string => {
  return renderToString(
    <StaticRouter location={route}>
      <CatalogRoutes />
    </StaticRouter>
  );
};
