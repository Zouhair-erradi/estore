# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Full-stack academic e-commerce platform (university project — Licence S6, Pr. Omar Zahour, Faculté des Sciences Ben M'Sick):
- **Backend** — Spring Boot REST API at `E-store/estore/`
- **Frontend** — React (Vite) SPA at `estore-frontend/`

Dual-database: MySQL for transactional data, MongoDB for product reviews.

---

## Backend (Spring Boot)

All commands run from `E-store/estore/` on **Windows PowerShell** (use `.\` prefix):

```powershell
.\mvnw.cmd spring-boot:run          # Run the application
.\mvnw.cmd clean install            # Build
.\mvnw.cmd clean test               # Run all tests
.\mvnw.cmd test -Dtest=ClassName    # Run a single test class
.\mvnw.cmd package -DskipTests      # Package JAR
```

**Prerequisites:**
- MySQL on `localhost:3306`, database `estore_db`, user `root`, password `0000`
- MongoDB on `localhost:27017`, database `estore_mongo`
- Java 21

**MySQL connection URL must include** `allowPublicKeyRetrieval=true` (MySQL 8 caching_sha2_password — already set in `application.properties`).

Database schema is auto-managed (`ddl-auto=update`). `DataInitializer.java` runs on every startup and:
1. Creates admin user `admin@estore.com` / `admin123` (role ADMIN) if not already present — always runs
2. Seeds **4 categories + 19 products** (academic catalog: Fournitures scolaires, Livres & Manuels, Informatique étudiant, Papeterie) with inventory — only if `categories` table is empty

To reset seed data, truncate all tables in MySQL then restart:
```sql
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE order_items; TRUNCATE TABLE orders;
TRUNCATE TABLE cart_items; TRUNCATE TABLE carts;
TRUNCATE TABLE inventory; TRUNCATE TABLE products; TRUNCATE TABLE categories;
SET FOREIGN_KEY_CHECKS = 1;
```

### Architecture

**Pattern:** `Controller → Service Interface → ServiceImpl → Repository → Entity`

**Source root:** `E-store/estore/src/main/java/com/estore/`

| Module | Responsibility | Database |
|---|---|---|
| `customer` | Registration, login (BCrypt), profile | MySQL |
| `catalog` | Products, categories, search/filter | MySQL |
| `shopping` | Cart and cart items | MySQL |
| `billing` | Order placement, history | MySQL |
| `inventory` | Stock levels, deduction on order | MySQL |
| `mongodb` | Product reviews | MongoDB |
| `config` | `DataInitializer` seed data + admin user | — |
| `exception` | `GlobalExceptionHandler` — maps exceptions to HTTP codes | — |

**Cross-domain flow on order placement:** `BillingServiceImpl.placeOrder()` saves the order, calls `InventoryService.deductStock()` per item, then `ShoppingService.clearCart()` — all in one `@Transactional` method.

### Key API Endpoints

Base path: `/api` — all controllers use `@CrossOrigin(origins = "*")`.

| Method | Path | Domain |
|---|---|---|
| POST | `/auth/register`, `/auth/login` | Customer |
| GET/PUT | `/auth/users/{id}`, `/auth/users/{id}/profile` | Customer |
| GET/POST/PUT/DELETE | `/products`, `/products/{id}` | Catalog |
| GET | `/categories` | Catalog |
| GET/POST/PUT/DELETE | `/cart/{userId}`, `/cart/add`, `/cart/update/{itemId}`, `/cart/remove/{itemId}`, `/cart/clear/{userId}` | Shopping |
| POST/GET | `/orders`, `/orders/user/{userId}`, `/orders/{id}` | Billing |
| GET/PUT/POST | `/inventory`, `/inventory/product/{productId}`, `/inventory/check`, `/inventory/deduct`, `/inventory/restore`, `/inventory/low-stock`, `/inventory/out-of-stock`, `/inventory/init/{productId}` | Inventory |
| POST/GET | `/reviews`, `/reviews/product/{productId}` | MongoDB |

**Query params:** `GET /products?search=keyword` or `GET /products?categoryId=1` (mutually exclusive filters). `PUT /cart/update/{itemId}?quantity=2` (quantity as query param, not body).

### Data Model

```
User ──1:1── Profile  (User.role: enum USER | ADMIN, default USER)
Category ──1:N── Product ──1:1── Inventory
Cart ──1:N── CartItem  (productId as plain Long, not FK)
Order ──1:N── OrderItem (denormalized: stores productName + unitPrice snapshot)
Review (MongoDB document) — productId and userId as plain fields
```

### Key Pitfalls & Fixes

- **`Category.products` has `@JsonIgnore`** — without it, Jackson causes infinite recursion (`Category → products → Product.category → Category → ...`) → 500 error. Never remove this annotation.
- **`UserResponse` includes `role` (String) and nested `ProfileDto`** — `GET /auth/users/{id}` returns `{ id, firstName, lastName, email, role, profile: { phone, address, city, country } }`. The `toResponse()` method in `CustomerServiceImpl` queries `profileRepository` to build this.
- **`ProductResponse` uses flat `categoryName: String`** — not a nested object. Frontend must use `product.categoryName`, not `product.category?.name`.
- **No Spring Security filter chain** — only `BCryptPasswordEncoder` from `spring-security-crypto`. No JWT — userId is sent directly in API requests. Role enforcement is frontend-only.
- **Admin user creation** in `DataInitializer` uses `userRepository.existsByEmail()` check — safe to re-run on every startup.

### Conventions

- **Lombok:** `@RequiredArgsConstructor` for constructor injection; `@Builder` + `@Data` on entities and DTOs.
- **DTOs:** Each module has a `dto/` sub-package; entities are never exposed directly.
- **Error handling:** `GlobalExceptionHandler` returns `{"error": "..."}` with proper HTTP status (404 for `EntityNotFoundException`, 400 for `IllegalStateException` and validation errors).

---

## Frontend (React + Vite)

All commands run from `estore-frontend/`:

```powershell
npm run dev      # Dev server → http://localhost:5173 (or next free port)
npm run build    # Production build
npm run preview  # Preview production build
```

**Stack:** React 19, React Router DOM v7, Axios, Vite 8.

### Architecture

```
src/
├── services/api.js          # All axios calls — single source of truth for API
├── context/AuthContext.jsx  # User state in localStorage; loginUser/logoutUser
├── components/
│   ├── Navbar.jsx           # Top nav, shows cart/orders/profile when logged in
│   └── PrivateRoute.jsx     # Redirects to /login if no user in context
└── features/
    ├── auth/                # LoginPage, RegisterPage
    ├── catalog/             # ProductListPage (search + category filter), ProductDetailPage
    ├── cart/                # CartPage (update qty, remove, checkout)
    ├── orders/              # OrderHistoryPage (expandable order details)
    └── profile/             # ProfilePage (view/edit profile)
```

**Auth flow:** Login response stores `{id, firstName, lastName, email, role, profile}` in `localStorage` under key `estore_user`. Check admin with `user.role === 'ADMIN'`. `ProfilePage` calls `GET /auth/users/{id}` to get the latest profile data — does not rely on the stored object for profile fields.

**API base URL:** `http://localhost:8080/api` — defined in `src/services/api.js`.

**Route protection:** `PrivateRoute` wraps `/cart`, `/orders`, `/profile`. All other routes are public.

**Key data flow on checkout:** `CartPage` sends cart items to `POST /api/orders` — the backend handles stock deduction and cart clearing atomically.

**Vite port conflict:** If port 5173 is in use, Vite auto-increments (5174, 5175…). Kill stale Node processes with `taskkill /IM node.exe /F` if needed.
