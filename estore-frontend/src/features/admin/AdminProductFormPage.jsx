import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getProduct, getCategories, createProduct, updateProduct, uploadImage, initInventory } from '../../services/api';
import AdminNav from '../../components/AdminNav';

export default function AdminProductFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const fileRef = useRef();

  const [categories,    setCategories]    = useState([]);
  const [form,          setForm]          = useState({ name: '', description: '', price: '', categoryId: '', initialStock: '0' });
  const [uploadedUrls,  setUploadedUrls]  = useState([]);   // URLs already on server
  const [stagedFiles,   setStagedFiles]   = useState([]);   // {file, preview} not uploaded yet
  const [uploading,     setUploading]     = useState(false);
  const [error,         setError]         = useState('');

  useEffect(() => {
    getCategories().then(res => setCategories(Array.isArray(res.data) ? res.data : []));
    if (isEdit) {
      getProduct(id).then(res => {
        const p = res.data;
        setForm({ name: p.name, description: p.description || '', price: p.price, categoryId: p.categoryId || '', initialStock: '0' });
        setUploadedUrls(p.imageUrls || []);
      });
    }
  }, [id, isEdit]);

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleFilePick = (e) => {
    const files = Array.from(e.target.files);
    const newStaged = files.map(file => ({ file, preview: URL.createObjectURL(file) }));
    setStagedFiles(prev => [...prev, ...newStaged]);
    e.target.value = '';
  };

  const removeUploaded = (idx) => setUploadedUrls(prev => prev.filter((_, i) => i !== idx));
  const removeStaged = (idx) => setStagedFiles(prev => {
    URL.revokeObjectURL(prev[idx].preview);
    return prev.filter((_, i) => i !== idx);
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setUploading(true);

    let allUrls = [...uploadedUrls];
    for (const { file } of stagedFiles) {
      try {
        const { data } = await uploadImage(file);
        allUrls.push(data.url);
      } catch {
        setError("Erreur lors de l'upload d'une image.");
        setUploading(false);
        return;
      }
    }
    setUploading(false);

    const payload = {
      name:        form.name,
      description: form.description,
      price:       parseFloat(form.price),
      categoryId:  parseInt(form.categoryId),
      imageUrls:   allUrls,
    };

    try {
      if (isEdit) {
        await updateProduct(id, payload);
      } else {
        const { data: newProduct } = await createProduct(payload);
        await initInventory(newProduct.id, parseInt(form.initialStock) || 0);
      }
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la sauvegarde.');
    }
  };

  const totalImages = uploadedUrls.length + stagedFiles.length;

  return (
    <div className="page-container">
      <AdminNav />
      <h1>{isEdit ? 'Modifier le produit' : 'Nouveau produit'}</h1>
      {error && <p className="error-msg">{error}</p>}

      <form onSubmit={handleSubmit} className="admin-form">
        <label>Nom</label>
        <input name="name" value={form.name} onChange={handleChange} required placeholder="Nom du produit" />

        <label>Description</label>
        <textarea name="description" value={form.description} onChange={handleChange} rows={3} placeholder="Description..." />

        <label>Prix (MAD)</label>
        <input name="price" type="number" step="0.01" min="0" value={form.price} onChange={handleChange} required placeholder="0.00" />

        <label>Catégorie</label>
        <select name="categoryId" value={form.categoryId} onChange={handleChange} required>
          <option value="">-- Choisir une catégorie --</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        {!isEdit && (
          <>
            <label>Stock initial</label>
            <input name="initialStock" type="number" min="0" value={form.initialStock} onChange={handleChange} placeholder="Ex: 50" />
          </>
        )}

        <label>Images du produit ({totalImages})</label>
        <div className="multi-image-section">
          {/* Thumbnails */}
          {(uploadedUrls.length > 0 || stagedFiles.length > 0) && (
            <div className="image-thumb-grid">
              {uploadedUrls.map((url, i) => (
                <div key={`up-${i}`} className="image-thumb">
                  <img src={url} alt={`img-${i}`} />
                  <button type="button" className="thumb-remove" onClick={() => removeUploaded(i)}>✕</button>
                  {i === 0 && <span className="thumb-badge">Principal</span>}
                </div>
              ))}
              {stagedFiles.map(({ preview }, i) => (
                <div key={`st-${i}`} className="image-thumb image-thumb--staged">
                  <img src={preview} alt={`staged-${i}`} />
                  <button type="button" className="thumb-remove" onClick={() => removeStaged(i)}>✕</button>
                  <span className="thumb-badge thumb-badge--pending">À uploader</span>
                </div>
              ))}
            </div>
          )}

          {/* Add button */}
          <button type="button" className="btn-add-image" onClick={() => fileRef.current.click()}>
            + Ajouter des images
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFilePick}
            style={{ display: 'none' }}
          />
          <p className="file-hint">Première image = image principale. Cliquez sur ✕ pour supprimer.</p>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={uploading}>
            {uploading ? 'Upload en cours...' : isEdit ? 'Enregistrer' : 'Créer le produit'}
          </button>
          <button type="button" className="btn-secondary" onClick={() => navigate('/admin')}>
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}
