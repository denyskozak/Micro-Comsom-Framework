import React from 'react';
import { Route, Routes } from 'react-router-dom';

const HeaderHome = (): JSX.Element => (
  <section>
    <h2>Header Micro-Frontend (React Router SSR)</h2>
    <button id="cosmos-signin-btn" type="button">
      Sign-In
    </button>
  </section>
);

export const HeaderRoutes = (): JSX.Element => (
  <Routes>
    <Route path="*" element={<HeaderHome />} />
  </Routes>
);
