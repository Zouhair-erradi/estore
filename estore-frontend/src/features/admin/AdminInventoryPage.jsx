import { useEffect, useState } from 'react';
import { getAllInventory, updateStock } from '../../services/api';
import AdminNav from '../../components/AdminNav';

export default function AdminInventoryPage() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    getAllInventory()
      .then(res => setItems(res.data))
      .catch(() => setError('Erreur lors du chargement du stock.'));
  }, []);

  const handleQtyChange = (productId, value) => {
    setEditing(prev => ({ ...prev, [productId]: value }));
  };

  const handleSave = async (productId) => {
    const quantity = parseInt(editing[productId]);
    if (isNaN(quantity) || quantity < 0) return;
    try {
      const res = await updateStock(productId, { quantity });
      setItems(prev => prev.map(i => i.productId === productId ? { ...i, quantity: res.data.quantity } : i));
      setEditing(prev => { const next = { ...prev }; delete next[productId]; return next; });
      setSuccess('Stock mis à jour.');
      setTimeout(() => setSuccess(''), 2500);
    } catch {
      setError('Erreur lors de la mise à jour.');
    }
  };

  const getStatusBadge = (item) => {
    if (item.quantity === 0) return <span className="cell-badge badge-rupture">Rupture</span>;
    if (item.lowStock)       return <span className="cell-badge badge-low">Stock faible</span>;
    return <span className="cell-badge badge-ok">OK</span>;
  };

  return (
    <div className="page-container">
      <AdminNav />
      <h1>Gestion du stock</h1>
      {error   && <p className="error-msg">{error}</p>}
      {success && <p className="success-msg">{success}</p>}
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Produit</th>
              <th>Stock actuel</th>
              <th>Seuil alerte</th>
              <th>Statut</th>
              <th>Nouveau stock</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.productId}>
                <td className="cell-name">{item.productName}</td>
                <td><strong>{item.quantity}</strong></td>
                <td>{item.lowStockThreshold}</td>
                <td>{getStatusBadge(item)}</td>
                <td>
                  <input
                    type="number"
                    min="0"
                    value={editing[item.productId] ?? item.quantity}
                    onChange={e => handleQtyChange(item.productId, e.target.value)}
                  />
                </td>
                <td>
                  <button className="btn-primary btn-sm" onClick={() => handleSave(item.productId)}>
                    Enregistrer
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
