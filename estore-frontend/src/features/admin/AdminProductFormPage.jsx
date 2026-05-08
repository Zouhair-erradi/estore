import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getProduct, getCategories, createProduct, updateProduct } from '../../services/api';

export default function AdminProductFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: '', description: '', price: '', imageUrl: '', categoryId: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    getCategories().then(res => setCategories(res.data));
    if (isEdit) {
      getProduct(id).then(res => {
        const p = res.data;
        setForm({
          name: p.name,
          description: p.description || '',
          price: p.price,
          imageUrl: p.imageUrl || '',
          categoryId: p.categoryId || '',
        });
      });
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const payload = { ...form, price: parseFloat(form.price), categoryId: parseInt(form.categoryId) };
    try {
      if (isEdit) {
        await updateProduct(id, payload);
      } else {
        await createProduct(payload);
      }
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la sauvegarde.');
    }
  };

  return (
    <div className="page-container">
      <h1>{isEdit ? 'Modifier le produit' : 'Nouveau produit'}</h1>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleSubmit} style={{ maxWidth: '480px', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <label>
          Nom
          <input name="name" value={form.name} onChange={handleChange} required />
        </label>
        <label>
          Description
          <textarea name="description" value={form.description} onChange={handleChange} rows={3} />
        </label>
        <label>
          Prix (MAD)
          <input name="price" type="number" step="0.01" min="0" value={form.price} onChange={handleChange} required />
        </label>
        <label>
          URL image
          <input name="imageUrl" value={form.imageUrl} onChange={handleChange} />
        </label>
        <label>
          Catégorie
          <select name="categoryId" value={form.categoryId} onChange={handleChange} required>
            <option value="">-- Choisir --</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </label>
        <button type="submit" className="btn-primary">{isEdit ? 'Enregistrer' : 'Créer'}</button>
        <button type="button" onClick={() => navigate('/admin')}>Annuler</button>
      </form>
    </div>
  );
}
