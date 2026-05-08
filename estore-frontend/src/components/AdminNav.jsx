import { NavLink } from 'react-router-dom';

export default function AdminNav() {
  return (
    <div className="admin-nav">
      <NavLink to="/admin" end className={({ isActive }) => isActive ? 'admin-nav-link active' : 'admin-nav-link'}>
        📦 Produits
      </NavLink>
      <NavLink to="/admin/categories" className={({ isActive }) => isActive ? 'admin-nav-link active' : 'admin-nav-link'}>
        🗂️ Catégories
      </NavLink>
      <NavLink to="/admin/inventory" className={({ isActive }) => isActive ? 'admin-nav-link active' : 'admin-nav-link'}>
        📊 Stock
      </NavLink>
      <NavLink to="/admin/orders" className={({ isActive }) => isActive ? 'admin-nav-link active' : 'admin-nav-link'}>
        🧾 Commandes
      </NavLink>
    </div>
  );
}
