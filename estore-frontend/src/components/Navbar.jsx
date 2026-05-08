import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/products" className="navbar-brand">🛒 E-Store</Link>
      <div className="navbar-links">
        <Link to="/products">Catalogue</Link>
        {user ? (
          <>
            {user.role === 'ADMIN' && <Link to="/admin">Admin</Link>}
            <Link to="/cart">Panier</Link>
            <Link to="/orders">Commandes</Link>
            <Link to="/profile">Mon profil</Link>
            <span className="navbar-user">Bonjour, {user.firstName}</span>
            <button className="btn-logout" onClick={handleLogout}>Déconnexion</button>
          </>
        ) : (
          <>
            <Link to="/login">Connexion</Link>
            <Link to="/register" className="btn-register">Inscription</Link>
          </>
        )}
      </div>
    </nav>
  );
}
