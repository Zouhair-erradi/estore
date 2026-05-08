import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProducts, deleteProduct } from '../../services/api';
import AdminNav from '../../components/AdminNav';

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
      <AdminNav />
      <div className="admin-header">
        <h1>Gestion des produits</h1>
        <Link to="/admin/products/new" className="btn-primary">+ Nouveau produit</Link>
      </div>
      {error && <p className="error-msg">{error}</p>}
      <div className="admin-table-wrap">
        <table className="admin-table">
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
                <td className="cell-id">#{p.id}</td>
                <td className="cell-name">{p.name}</td>
                <td>{p.categoryName}</td>
                <td className="cell-price">{p.price.toFixed(2)}</td>
                <td>
                  <Link to={`/admin/products/edit/${p.id}`} className="action-link">Modifier</Link>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="btn-danger btn-sm"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
