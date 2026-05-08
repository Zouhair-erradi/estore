import { useEffect, useState } from 'react';
import { getAllInventory, updateStock } from '../../services/api';

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
      setTimeout(() => setSuccess(''), 2000);
    } catch {
      setError('Erreur lors de la mise à jour.');
    }
  };

  return (
    <div className="page-container">
      <h1>Gestion du stock</h1>
      {error && <p className="error-message">{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
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
              <td>{item.productName}</td>
              <td>{item.quantity}</td>
              <td>{item.lowStockThreshold}</td>
              <td style={{ color: item.quantity === 0 ? 'red' : item.lowStock ? 'orange' : 'green' }}>
                {item.quantity === 0 ? 'Rupture' : item.lowStock ? 'Stock faible' : 'OK'}
              </td>
              <td>
                <input
                  type="number"
                  min="0"
                  style={{ width: '80px' }}
                  value={editing[item.productId] ?? item.quantity}
                  onChange={e => handleQtyChange(item.productId, e.target.value)}
                />
              </td>
              <td>
                <button onClick={() => handleSave(item.productId)}>Enregistrer</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
