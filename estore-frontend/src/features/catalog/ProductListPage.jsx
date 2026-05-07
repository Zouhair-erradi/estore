import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProducts, getCategories } from '../../services/api';

export default function ProductListPage() {
  const [products,   setProducts]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [search,     setSearch]     = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');

  useEffect(() => {
    getCategories()
      .then(({ data }) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    setError('');
    const params = {};
    if (search)     params.search     = search;
    if (categoryId) params.categoryId = categoryId;
    getProducts(params)
      .then(({ data }) => setProducts(data))
      .catch(() => setError('Impossible de charger les produits.'))
      .finally(() => setLoading(false));
  }, [search, categoryId]);

  return (
    <div className="page-container">
      <h1>Catalogue</h1>

      <div className="filters">
        <input
          type="text"
          placeholder="🔍 Rechercher un produit..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="filter-select">
          <option value="">Toutes les catégories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {loading && <p className="loading-msg">Chargement...</p>}
      {error   && <p className="error-msg">{error}</p>}

      {!loading && !error && products.length === 0 && (
        <p className="empty-msg">Aucun produit trouvé.</p>
      )}

      <div className="product-grid">
        {products.map((p) => (
          <div key={p.id} className="product-card">
            {p.imageUrl && (
              <img src={p.imageUrl} alt={p.name} className="product-img" />
            )}
            <div className="product-info">
              <span className="product-category">{p.categoryName}</span>
              <h3>{p.name}</h3>
              <p className="product-price">{p.price?.toFixed(2)} MAD</p>
              <Link to={`/products/${p.id}`} className="btn-primary btn-sm">
                Voir le détail
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
