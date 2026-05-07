import { useState, useEffect } from 'react';
import { getUserOrders } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const STATUS_LABELS = {
  PENDING:   { label: 'En attente',  color: '#f59e0b' },
  CONFIRMED: { label: 'Confirmée',   color: '#3b82f6' },
  SHIPPED:   { label: 'Expédiée',    color: '#8b5cf6' },
  DELIVERED: { label: 'Livrée',      color: '#10b981' },
  CANCELLED: { label: 'Annulée',     color: '#ef4444' },
};

export default function OrderHistoryPage() {
  const { user }   = useAuth();
  const [orders,   setOrders]   = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');

  useEffect(() => {
    getUserOrders(user.id)
      .then(({ data }) => setOrders(data))
      .catch(() => setError('Impossible de charger les commandes.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="loading-msg">Chargement...</p>;
  if (error)   return <p className="error-msg">{error}</p>;

  return (
    <div className="page-container">
      <h1>Mes commandes</h1>
      {orders.length === 0 && <p className="empty-msg">Aucune commande pour le moment.</p>}
      <div className="orders-list">
        {orders.map((order) => {
          const statusInfo = STATUS_LABELS[order.status] || { label: order.status, color: '#6b7280' };
          return (
            <div key={order.id} className="order-card">
              <div className="order-header" onClick={() => setExpanded(expanded === order.id ? null : order.id)}>
                <div>
                  <span className="order-id">Commande #{order.id}</span>
                  <span className="order-date">
                    {new Date(order.orderDate).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                <div className="order-meta">
                  <span className="status-badge" style={{ backgroundColor: statusInfo.color }}>
                    {statusInfo.label}
                  </span>
                  <span className="order-total">{order.totalAmount?.toFixed(2)} MAD</span>
                  <span className="expand-icon">{expanded === order.id ? '▲' : '▼'}</span>
                </div>
              </div>

              {expanded === order.id && (
                <div className="order-items">
                  <table>
                    <thead>
                      <tr>
                        <th>Produit</th>
                        <th>Quantité</th>
                        <th>Prix unitaire</th>
                        <th>Sous-total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items?.map((item) => (
                        <tr key={item.id}>
                          <td>{item.productName}</td>
                          <td>{item.quantity}</td>
                          <td>{item.unitPrice?.toFixed(2)} MAD</td>
                          <td>{item.subtotal?.toFixed(2)} MAD</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
