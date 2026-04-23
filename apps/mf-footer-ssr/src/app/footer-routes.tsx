import React from 'react';
import { Route, Routes } from 'react-router-dom';

const FooterHome = (): JSX.Element => (
  <section>
    <small>Footer Micro-Frontend (React Router SSR) · © Cosmos Platform</small>
  </section>
);

export const FooterRoutes = (): JSX.Element => (
  <Routes>
    <Route path="*" element={<FooterHome />} />
  </Routes>
);
