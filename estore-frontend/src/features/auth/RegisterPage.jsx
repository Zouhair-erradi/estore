import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../../services/api';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.firstName || !form.lastName || !form.email || !form.password) {
      setError('Veuillez remplir tous les champs.');
      return;
    }
    if (form.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    setLoading(true);
    try {
      await register(form);
      setSuccess('Compte créé avec succès ! Redirection...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de l\'inscription.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Créer un compte</h2>
        {error   && <p className="error-msg">{error}</p>}
        {success && <p className="success-msg">{success}</p>}
        <form onSubmit={handleSubmit}>
          <label>Prénom</label>
          <input name="firstName" value={form.firstName} onChange={handleChange} placeholder="Prénom" />
          <label>Nom</label>
          <input name="lastName" value={form.lastName} onChange={handleChange} placeholder="Nom" />
          <label>Email</label>
          <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="exemple@email.com" />
          <label>Mot de passe</label>
          <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="Min. 6 caractères" />
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Création...' : 'S\'inscrire'}
          </button>
        </form>
        <p className="auth-footer">
          Déjà un compte ? <Link to="/login">Se connecter</Link>
        </p>
      </div>
    </div>
  );
}
