import { useState, useEffect } from 'react';
import { getCategories, createCategory, deleteCategory } from '../../services/api';
import AdminNav from '../../components/AdminNav';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [form, setForm]             = useState({ name: '', description: '' });
  const [msg, setMsg]               = useState('');
  const [error, setError]           = useState('');

  const load = () =>
    getCategories().then(({ data }) => setCategories(Array.isArray(data) ? data : []));

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg(''); setError('');
    try {
      await createCategory(form);
      setMsg('✅ Catégorie ajoutée !');
      setForm({ name: '', description: '' });
      load();
    } catch (err) {
      setError(err.response?.data?.error || '❌ Erreur lors de la création.');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Supprimer la catégorie "${name}" ? Tous ses produits perdront leur catégorie.`)) return;
    setError('');
    try {
      await deleteCategory(id);
      setCategories(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      setError(err.response?.data?.error || '❌ Erreur lors de la suppression.');
    }
  };

  return (
    <div className="page-container">
      <AdminNav />
      <h1>Gestion des catégories</h1>

      <div className="admin-two-col">
        {/* ── Formulaire ajout ── */}
        <div className="admin-card">
          <h2>Nouvelle catégorie</h2>
          {msg   && <p className="success-msg">{msg}</p>}
          {error && <p className="error-msg">{error}</p>}
          <form onSubmit={handleSubmit} className="admin-form">
            <label>Nom</label>
            <input
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              required
              placeholder="Ex: Fournitures scolaires"
            />
            <label>Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Description de la catégorie..."
            />
            <button type="submit" className="btn-primary" style={{ marginTop: '12px' }}>
              + Ajouter
            </button>
          </form>
        </div>

        {/* ── Liste des catégories ── */}
        <div className="admin-card">
          <h2>Catégories existantes ({categories.length})</h2>
          {categories.length === 0 && <p className="empty-msg">Aucune catégorie.</p>}
          <div className="category-list">
            {categories.map(c => (
              <div key={c.id} className="category-row">
                <div>
                  <strong>{c.name}</strong>
                  {c.description && <p className="cat-desc">{c.description}</p>}
                </div>
                <button className="btn-danger" onClick={() => handleDelete(c.id, c.name)}>
                  Supprimer
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
