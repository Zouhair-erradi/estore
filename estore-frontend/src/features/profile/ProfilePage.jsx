import { useState, useEffect } from 'react';
import { getUser, updateProfile } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [form,     setForm]    = useState({ phone: '', address: '', city: '', country: '' });
  const [info,     setInfo]    = useState(null);
  const [msg,      setMsg]     = useState('');
  const [loading,  setLoading] = useState(true);
  const [saving,   setSaving]  = useState(false);

  useEffect(() => {
    getUser(user.id)
      .then(({ data }) => {
        setInfo(data);
        if (data.profile) {
          setForm({
            phone:   data.profile.phone   || '',
            address: data.profile.address || '',
            city:    data.profile.city    || '',
            country: data.profile.country || '',
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    setSaving(true);
    try {
      await updateProfile(user.id, form);
      updateUser({ profile: form });
      setMsg('✅ Profil mis à jour avec succès !');
    } catch {
      setMsg('❌ Erreur lors de la mise à jour.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="loading-msg">Chargement...</p>;

  return (
    <div className="page-container">
      <h1>Mon profil</h1>

      <div className="profile-card">
        <div className="profile-identity">
          <div className="profile-avatar">
            {user.firstName?.[0]}{user.lastName?.[0]}
          </div>
          <div>
            <h2>{user.firstName} {user.lastName}</h2>
            <p>{user.email}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="profile-form">
          <h3>Informations personnelles</h3>
          {msg && <p className={msg.startsWith('✅') ? 'success-msg' : 'error-msg'}>{msg}</p>}

          <div className="form-row">
            <div>
              <label>Téléphone</label>
              <input name="phone" value={form.phone} onChange={handleChange} placeholder="0600000000" />
            </div>
            <div>
              <label>Ville</label>
              <input name="city" value={form.city} onChange={handleChange} placeholder="Casablanca" />
            </div>
          </div>
          <label>Adresse</label>
          <input name="address" value={form.address} onChange={handleChange} placeholder="123 Rue..." />
          <label>Pays</label>
          <input name="country" value={form.country} onChange={handleChange} placeholder="Maroc" />

          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </button>
        </form>
      </div>
    </div>
  );
}
