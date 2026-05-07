import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getProduct, checkStock, addToCart,
  getProductReviews, addReview,
} from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function ProductDetailPage() {
  const { id }      = useParams();
  const { user }    = useAuth();
  const navigate    = useNavigate();

  const [product,   setProduct]   = useState(null);
  const [stock,     setStock]     = useState(null);
  const [quantity,  setQuantity]  = useState(1);
  const [reviews,   setReviews]   = useState([]);
  const [cartMsg,   setCartMsg]   = useState('');
  const [loading,   setLoading]   = useState(true);

  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [reviewMsg,  setReviewMsg]  = useState('');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getProduct(id),
      getProductReviews(id),
    ]).then(([prodRes, revRes]) => {
      setProduct(prodRes.data);
      setReviews(revRes.data);
      return checkStock(id, 1);
    }).then(({ data }) => {
      setStock(data);
    }).catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) { navigate('/login'); return; }
    try {
      const stockCheck = await checkStock(id, quantity);
      if (!stockCheck.data.available) {
        setCartMsg('❌ Stock insuffisant pour cette quantité.');
        return;
      }
      await addToCart({
        userId:      user.id,
        productId:   product.id,
        productName: product.name,
        quantity,
        unitPrice:   product.price,
      });
      setCartMsg('✅ Produit ajouté au panier !');
    } catch {
      setCartMsg('❌ Erreur lors de l\'ajout au panier.');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    if (!reviewForm.comment.trim()) {
      setReviewMsg('Veuillez écrire un commentaire.');
      return;
    }
    try {
      await addReview({
        productId:  Number(id),
        userId:     user.id,
        authorName: `${user.firstName} ${user.lastName}`,
        rating:     reviewForm.rating,
        comment:    reviewForm.comment,
      });
      setReviewMsg('✅ Avis publié !');
      setReviewForm({ rating: 5, comment: '' });
      const { data } = await getProductReviews(id);
      setReviews(data);
    } catch {
      setReviewMsg('❌ Erreur lors de la publication.');
    }
  };

  if (loading) return <p className="loading-msg">Chargement...</p>;
  if (!product) return <p className="error-msg">Produit introuvable.</p>;

  const available = stock?.available ?? false;

  return (
    <div className="page-container">
      <button className="btn-back" onClick={() => navigate(-1)}>← Retour</button>

      <div className="detail-layout">
        <div className="detail-image">
          {product.imageUrl
            ? <img src={product.imageUrl} alt={product.name} />
            : <div className="no-image">Pas d'image</div>
          }
        </div>

        <div className="detail-info">
          <span className="product-category">{product.categoryName}</span>
          <h1>{product.name}</h1>
          <p className="detail-description">{product.description}</p>
          <p className="detail-price">{product.price?.toFixed(2)} MAD</p>

          <p className={`stock-badge ${available ? 'in-stock' : 'out-of-stock'}`}>
            {available ? '✓ En stock' : '✗ Rupture de stock'}
          </p>

          {available && (
            <div className="add-to-cart">
              <label>Quantité</label>
              <input
                type="number"
                min="1"
                max={stock?.availableQuantity ?? 99}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="qty-input"
              />
              <button className="btn-primary" onClick={handleAddToCart}>
                Ajouter au panier
              </button>
            </div>
          )}
          {cartMsg && <p className={cartMsg.startsWith('✅') ? 'success-msg' : 'error-msg'}>{cartMsg}</p>}
        </div>
      </div>

      <section className="reviews-section">
        <h2>Avis clients ({reviews.length})</h2>

        {reviews.length === 0 && <p className="empty-msg">Aucun avis pour ce produit.</p>}
        <div className="reviews-list">
          {reviews.map((r) => (
            <div key={r.id} className="review-card">
              <div className="review-header">
                <strong>{r.authorName}</strong>
                <span className="review-stars">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
              </div>
              <p>{r.comment}</p>
              <small>{new Date(r.createdAt).toLocaleDateString('fr-FR')}</small>
            </div>
          ))}
        </div>

        {user && (
          <div className="review-form">
            <h3>Laisser un avis</h3>
            {reviewMsg && <p className={reviewMsg.startsWith('✅') ? 'success-msg' : 'error-msg'}>{reviewMsg}</p>}
            <form onSubmit={handleReviewSubmit}>
              <label>Note</label>
              <select
                value={reviewForm.rating}
                onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}
              >
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>{'★'.repeat(n)} ({n}/5)</option>
                ))}
              </select>
              <label>Commentaire</label>
              <textarea
                rows={3}
                value={reviewForm.comment}
                onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                placeholder="Votre avis sur ce produit..."
              />
              <button type="submit" className="btn-primary">Publier</button>
            </form>
          </div>
        )}
      </section>
    </div>
  );
}
