import React from 'react';
import { Routes, Route, Link, useParams } from 'react-router-dom';

const products = [
  { id: '1', name: 'Enterprise Router', description: 'Edge-aware API gateway router.' },
  { id: '2', name: 'Catalog Cache', description: 'Layered cache for distributed product reads.' },
  { id: '3', name: 'Composer Proxy', description: 'SSR composition gateway for federated pages.' }
];

const CatalogList = () => (
  <section>
    <h2>Catalog Micro-Frontend</h2>
    <p>This HTML is server-rendered by the React catalog micro-frontend.</p>
    <ul>
      {products.map((product) => (
        <li key={product.id}>
          <Link to={`/catalog/${product.id}`}>{product.name}</Link>
        </li>
      ))}
    </ul>
  </section>
);

const CatalogDetail = () => {
  const params = useParams<{ id: string }>();
  const product = products.find((item) => item.id === params.id);

  if (!product) {
    return <p>Product not found.</p>;
  }

  return (
    <article>
      <h2>{product.name}</h2>
      <p>{product.description}</p>
      <Link to="/catalog">Back to catalog</Link>
    </article>
  );
};

export const CatalogRoutes = () => (
  <Routes>
    <Route path="/catalog" element={<CatalogList />} />
    <Route path="/catalog/:id" element={<CatalogDetail />} />
    <Route path="*" element={<p>Catalog route not found.</p>} />
  </Routes>
);
