import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProducts, deleteProduct } from '../../services/api';

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    getProducts()
      .then(res => setProducts(res.data))
      .catch(() => setError('Erreur lors du chargement des produits.'));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce produit ?')) return;
    try {
      await deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch {
      setError('Erreur lors de la suppression.');
    }
  };

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Gestion des produits</h1>
        <Link to="/admin/products/new" className="btn-primary">+ Nouveau produit</Link>
      </div>
      {error && <p className="error-message">{error}</p>}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nom</th>
            <th>Catégorie</th>
            <th>Prix (MAD)</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map(p => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.name}</td>
              <td>{p.categoryName}</td>
              <td>{p.price.toFixed(2)}</td>
              <td>
                <Link to={`/admin/products/edit/${p.id}`} style={{ marginRight: '0.5rem' }}>Modifier</Link>
                <button onClick={() => handleDelete(p.id)} style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer' }}>
                  Supprimer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
