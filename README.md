# E-Store — Plateforme e-commerce académique

Mini-projet Full Stack — Module Full Stack  
Encadrant : Pr. Omar Zahour — Faculté des Sciences Ben M'Sick, Université Hassan II de Casablanca

---

## Technologies

| Couche | Technologie |
|---|---|
| Backend | Spring Boot 3, Spring Data JPA, Maven |
| Base relationnelle | MySQL 8 |
| Base documentaire | MongoDB |
| Frontend | React 19 + Vite |

---

## Prérequis

- Java 21
- Maven (ou utiliser le wrapper `mvnw.cmd` inclus)
- MySQL 8 sur `localhost:3306`
- MongoDB sur `localhost:27017`
- Node.js 18+

---

## Lancement du backend

```powershell
# 1. Créer la base MySQL (une seule fois)
# Dans MySQL Workbench ou le CLI :
CREATE DATABASE estore_db;

# 2. Démarrer le backend depuis E-store/estore/
cd E-store\estore
.\mvnw.cmd spring-boot:run
```

Le backend démarre sur **http://localhost:8080**

Au premier démarrage, `DataInitializer` insère automatiquement :
- 4 catégories
- 19 produits avec stock
- 1 compte administrateur

---

## Lancement du frontend

```powershell
cd estore-frontend
npm install      # une seule fois
npm run dev
```

Le frontend démarre sur **http://localhost:5173**

---

## Comptes de test

| Rôle | Email | Mot de passe |
|---|---|---|
| Administrateur | admin@estore.com | admin123 |
| Utilisateur | *(créer via /register)* | — |

---

## Configuration base de données

Fichier : `E-store/estore/src/main/resources/application.properties`

```properties
# MySQL
spring.datasource.url=jdbc:mysql://localhost:3306/estore_db?allowPublicKeyRetrieval=true&useSSL=false
spring.datasource.username=root
spring.datasource.password=0000

# MongoDB
spring.data.mongodb.uri=mongodb://localhost:27017/estore_mongo
```

---

## Réinitialiser les données de démonstration

Si vous souhaitez repartir des données initiales, exécutez dans MySQL :

```sql
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE order_items;
TRUNCATE TABLE orders;
TRUNCATE TABLE cart_items;
TRUNCATE TABLE carts;
TRUNCATE TABLE inventory;
TRUNCATE TABLE products;
TRUNCATE TABLE categories;
SET FOREIGN_KEY_CHECKS = 1;
```

Puis redémarrez le backend — les 19 produits sont réinsérés automatiquement.

---

## Structure du projet

```
estore/
├── E-store/estore/          # Backend Spring Boot
│   └── src/main/java/com/estore/
│       ├── customer/        # Inscription, connexion, profil
│       ├── catalog/         # Produits, catégories, recherche
│       ├── inventory/       # Gestion du stock
│       ├── shopping/        # Panier
│       ├── billing/         # Commandes
│       ├── mongodb/         # Avis produits (MongoDB)
│       ├── config/          # DataInitializer
│       └── exception/       # GlobalExceptionHandler
└── estore-frontend/         # Frontend React + Vite
    └── src/
        ├── services/api.js  # Tous les appels HTTP
        ├── context/         # AuthContext (état utilisateur)
        ├── components/      # Navbar, PrivateRoute, PrivateAdminRoute
        └── features/        # auth, catalog, cart, orders, profile, admin
```

---

## Scénario de démonstration

1. Ouvrir **http://localhost:5173**
2. S'inscrire via `/register` ou se connecter
3. Parcourir le catalogue, filtrer par catégorie, rechercher un produit
4. Ajouter des produits au panier
5. Valider la commande depuis `/cart`
6. Consulter l'historique dans `/orders`
7. Laisser un avis sur une fiche produit (MongoDB)
8. Se connecter avec `admin@estore.com` pour accéder au panneau admin (`/admin`)
