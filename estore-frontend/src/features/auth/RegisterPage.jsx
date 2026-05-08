import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../../services/api';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm]       = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [errors, setErrors]   = useState({});
  const [success, setSuccess] = useState('');
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors(prev => ({ ...prev, [e.target.name]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = 'Le prénom est obligatoire.';
    if (!form.lastName.trim())  e.lastName  = 'Le nom est obligatoire.';
    if (!form.email.trim())     e.email     = "L'email est obligatoire.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Email invalide.';
    if (!form.password)         e.password  = 'Le mot de passe est obligatoire.';
    else if (form.password.length < 6) e.password = 'Minimum 6 caractères.';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    const fieldErrors = validate();
    if (Object.keys(fieldErrors).length > 0) { setErrors(fieldErrors); return; }
    setLoading(true);
    try {
      await register(form);
      setSuccess('Compte créé avec succès ! Redirection...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setServerError(err.response?.data?.error || "Erreur lors de l'inscription.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Créer un compte</h2>
        {serverError && <p className="error-msg">{serverError}</p>}
        {success     && <p className="success-msg">{success}</p>}
        <form onSubmit={handleSubmit} noValidate>
          <label>Prénom</label>
          <input name="firstName" value={form.firstName} onChange={handleChange} placeholder="Prénom" />
          {errors.firstName && <p className="field-error">{errors.firstName}</p>}

          <label>Nom</label>
          <input name="lastName" value={form.lastName} onChange={handleChange} placeholder="Nom" />
          {errors.lastName && <p className="field-error">{errors.lastName}</p>}

          <label>Email</label>
          <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="exemple@email.com" />
          {errors.email && <p className="field-error">{errors.email}</p>}

          <label>Mot de passe</label>
          <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="Min. 6 caractères" />
          {errors.password && <p className="field-error">{errors.password}</p>}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Création...' : "S'inscrire"}
          </button>
        </form>
        <p className="auth-footer">
          Déjà un compte ? <Link to="/login">Se connecter</Link>
        </p>
      </div>
    </div>
  );
}
