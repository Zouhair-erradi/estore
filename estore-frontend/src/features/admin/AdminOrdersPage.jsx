import { useEffect, useState } from 'react';
import { getAllOrders, updateOrderStatus } from '../../services/api';
import AdminNav from '../../components/AdminNav';

const STATUS_LABELS = {
  PENDING:   { label: 'En attente',  color: '#f59e0b' },
  CONFIRMED: { label: 'Confirmée',   color: '#3b82f6' },
  SHIPPED:   { label: 'Expédiée',    color: '#8b5cf6' },
  DELIVERED: { label: 'Livrée',      color: '#10b981' },
  CANCELLED: { label: 'Annulée',     color: '#ef4444' },
};

const STATUS_ORDER = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

export default function AdminOrdersPage() {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [expanded, setExpanded] = useState(null);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    getAllOrders()
      .then(res => setOrders(res.data))
      .catch(() => setError('Erreur lors du chargement des commandes.'))
      .finally(() => setLoading(false));
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdating(orderId);
    try {
      const { data } = await updateOrderStatus(orderId, newStatus);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: data.status } : o));
    } catch {
      setError('Erreur lors de la mise à jour du statut.');
    } finally {
      setUpdating(null);
    }
  };

  const counts = STATUS_ORDER.reduce((acc, s) => {
    acc[s] = orders.filter(o => o.status === s).length;
    return acc;
  }, {});

  return (
    <div className="page-container">
      <AdminNav />
      <h1>Gestion des commandes</h1>

      {/* Résumé */}
      <div className="order-stats">
        {STATUS_ORDER.map(s => (
          <div key={s} className="order-stat-card" style={{ borderTop: `3px solid ${STATUS_LABELS[s].color}` }}>
            <span className="stat-count" style={{ color: STATUS_LABELS[s].color }}>{counts[s]}</span>
            <span className="stat-label">{STATUS_LABELS[s].label}</span>
          </div>
        ))}
      </div>

      {error   && <p className="error-msg">{error}</p>}
      {loading && <p className="loading-msg">Chargement...</p>}

      {!loading && orders.length === 0 && (
        <p className="empty-msg">Aucune commande pour le moment.</p>
      )}

      <div className="orders-list">
        {orders.map(order => {
          const st = STATUS_LABELS[order.status] || { label: order.status, color: '#6b7280' };
          const isOpen = expanded === order.id;
          return (
            <div key={order.id} className="order-card">
              <div className="order-header" onClick={() => setExpanded(isOpen ? null : order.id)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                  <span className="order-id">#{order.id}</span>
                  <span className="order-date">
                    {new Date(order.orderDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span style={{ fontSize: '13px', color: '#6b7280' }}>Client #{order.userId}</span>
                </div>
                <div className="order-meta">
                  <span className="status-badge" style={{ background: st.color }}>{st.label}</span>
                  <span className="order-total">{order.totalAmount?.toFixed(2)} MAD</span>
                  <span className="expand-icon">{isOpen ? '▲' : '▼'}</span>
                </div>
              </div>

              {isOpen && (
                <div className="order-items">
                  {/* Changer le statut */}
                  <div className="order-status-bar">
                    <span style={{ fontWeight: 600, fontSize: '14px' }}>Changer le statut :</span>
                    <div className="status-btn-group">
                      {STATUS_ORDER.map(s => (
                        <button
                          key={s}
                          disabled={order.status === s || updating === order.id}
                          onClick={() => handleStatusChange(order.id, s)}
                          className={`status-btn ${order.status === s ? 'status-btn--active' : ''}`}
                          style={{ '--btn-color': STATUS_LABELS[s].color }}
                        >
                          {STATUS_LABELS[s].label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Articles */}
                  <table className="admin-table" style={{ marginTop: '16px' }}>
                    <thead>
                      <tr>
                        <th>Produit</th>
                        <th>Qté</th>
                        <th>Prix unit.</th>
                        <th>Sous-total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items?.map(item => (
                        <tr key={item.id}>
                          <td className="cell-name">{item.productName}</td>
                          <td>{item.quantity}</td>
                          <td>{item.unitPrice?.toFixed(2)} MAD</td>
                          <td className="cell-price">{item.subtotal?.toFixed(2)} MAD</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div style={{ textAlign: 'right', marginTop: '12px', fontWeight: 700, fontSize: '15px' }}>
                    Total : <span style={{ color: 'var(--primary)', fontSize: '18px' }}>{order.totalAmount?.toFixed(2)} MAD</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
