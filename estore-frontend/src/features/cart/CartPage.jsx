import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCart, updateCart, removeFromCart, placeOrder } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function CartPage() {
  const { user }   = useAuth();
  const navigate   = useNavigate();
  const [cart,     setCart]     = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [orderMsg, setOrderMsg] = useState('');
  const [placing,  setPlacing]  = useState(false);

  const loadCart = () => {
    setLoading(true);
    getCart(user.id)
      .then(({ data }) => setCart(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadCart(); }, []);

  const handleQuantityChange = async (itemId, newQty) => {
    try {
      const { data } = await updateCart(itemId, newQty);
      setCart(data);
    } catch {}
  };

  const handleRemove = async (itemId) => {
    try {
      await removeFromCart(itemId);
      loadCart();
    } catch {}
  };

  const handleOrder = async () => {
    if (!cart?.items?.length) return;
    setOrderMsg('');
    setPlacing(true);
    try {
      await placeOrder({
        userId: user.id,
        items:  cart.items.map((i) => ({
          productId:   i.productId,
          productName: i.productName,
          quantity:    i.quantity,
          unitPrice:   i.unitPrice,
        })),
      });
      setOrderMsg('✅ Commande passée avec succès !');
      setTimeout(() => navigate('/orders'), 1500);
    } catch (err) {
      setOrderMsg(err.response?.data?.error || '❌ Erreur lors de la commande.');
    } finally {
      setPlacing(false);
    }
  };

  if (loading) return <p className="loading-msg">Chargement du panier...</p>;

  const items = cart?.items ?? [];
  const profileComplete = !!(user?.profile?.phone?.trim() && user?.profile?.address?.trim());

  return (
    <div className="page-container">
      <h1>Mon panier</h1>

      {items.length === 0 ? (
        <div className="empty-cart">
          <p>Votre panier est vide.</p>
          <button className="btn-primary" onClick={() => navigate('/products')}>
            Voir le catalogue
          </button>
        </div>
      ) : (
        <>
          <div className="cart-table">
            <div className="cart-header">
              <span>Produit</span>
              <span>Prix unitaire</span>
              <span>Quantité</span>
              <span>Sous-total</span>
              <span></span>
            </div>
            {items.map((item) => (
              <div key={item.itemId} className="cart-row">
                <span className="cart-name">{item.productName}</span>
                <span>{item.unitPrice?.toFixed(2)} MAD</span>
                <span>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleQuantityChange(item.itemId, Number(e.target.value))}
                    className="qty-input"
                  />
                </span>
                <span>{item.subtotal?.toFixed(2)} MAD</span>
                <span>
                  <button className="btn-danger" onClick={() => handleRemove(item.itemId)}>✕</button>
                </span>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            {!profileComplete && (
              <div className="profile-required-msg">
                ⚠️ Votre profil est incomplet. Ajoutez votre <strong>téléphone</strong> et votre <strong>adresse</strong> pour passer commande.{' '}
                <a href="/profile">Compléter mon profil →</a>
              </div>
            )}
            <p className="cart-total">Total : <strong>{cart.total?.toFixed(2)} MAD</strong></p>
            {orderMsg && (
              <p className={orderMsg.startsWith('✅') ? 'success-msg' : 'error-msg'}>{orderMsg}</p>
            )}
            <button
              className="btn-primary btn-large"
              onClick={handleOrder}
              disabled={placing || !profileComplete}
            >
              {placing ? 'Traitement...' : 'Valider la commande'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
