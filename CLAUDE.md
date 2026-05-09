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
TRUNCATE TABLE inventory; TRUNCATE TABLE product_images; TRUNCATE TABLE products; TRUNCATE TABLE categories;
SET FOREIGN_KEY_CHECKS = 1;
```

### Architecture

**Pattern:** `Controller → Service Interface → ServiceImpl → Repository → Entity`

**Source root:** `E-store/estore/src/main/java/com/estore/`

| Module | Responsibility | Database |
|---|---|---|
| `customer` | Registration, login (BCrypt), profile | MySQL |
| `catalog` | Products, categories, image upload | MySQL |
| `shopping` | Cart and cart items | MySQL |
| `billing` | Order placement, history, status management | MySQL |
| `inventory` | Stock levels, deduction on order | MySQL |
| `mongodb` | Product reviews | MongoDB |
| `config` | `DataInitializer` seed data + admin user, `WebConfig` static files | — |
| `exception` | `GlobalExceptionHandler` — maps exceptions to HTTP codes | — |

**Cross-domain flow on order placement:** `BillingServiceImpl.placeOrder()` saves the order, calls `InventoryService.deductStock()` per item, then `ShoppingService.clearCart()` — all in one `@Transactional` method.

### Key API Endpoints

Base path: `/api` — all controllers use `@CrossOrigin(origins = "*")`.

| Method | Path | Domain |
|---|---|---|
| POST | `/auth/register`, `/auth/login` | Customer |
| GET/PUT | `/auth/users/{id}`, `/auth/users/{id}/profile` | Customer |
| GET/POST/PUT/DELETE | `/products`, `/products/{id}` | Catalog |
| GET/POST/DELETE | `/categories`, `/categories/{id}` | Catalog |
| POST | `/upload` — multipart image upload, returns `{"url": "..."}` | Catalog |
| GET/POST/PUT/DELETE | `/cart/{userId}`, `/cart/add`, `/cart/update/{itemId}`, `/cart/remove/{itemId}`, `/cart/clear/{userId}` | Shopping |
| GET/POST | `/orders` (all orders, admin), `/orders/user/{userId}`, `/orders/{id}` | Billing |
| PUT | `/orders/{id}/status?status=CONFIRMED` | Billing |
| GET/PUT/POST | `/inventory`, `/inventory/product/{productId}`, `/inventory/check`, `/inventory/deduct`, `/inventory/restore`, `/inventory/low-stock`, `/inventory/out-of-stock`, `/inventory/init/{productId}` | Inventory |
| POST/GET | `/reviews`, `/reviews/product/{productId}` | MongoDB |

**Query params:** `GET /products?search=keyword` or `GET /products?categoryId=1` (mutually exclusive). `PUT /cart/update/{itemId}?quantity=2` (quantity as query param, not body). `POST /inventory/init/{productId}?quantity=50`.

**Image upload flow:** `POST /upload` (multipart/form-data, field `file`) → saves to `E-store/estore/uploads/` → returns URL `http://localhost:8080/images/{filename}`. Static files served by `WebConfig` at `/images/**`. Always call `POST /inventory/init/{productId}?quantity=N` after creating a product — no inventory row is created automatically.

**Order statuses:** `PENDING → CONFIRMED → SHIPPED → DELIVERED` (or `CANCELLED` at any stage). No enforced state machine — any transition is accepted.

### Data Model

```
User ──1:1── Profile  (User.role: enum USER | ADMIN, default USER)
Category ──1:N── Product ──1:1── Inventory
                 Product ──1:N── product_images (imageUrls via @ElementCollection)
Cart ──1:N── CartItem  (productId as plain Long, not FK)
Order ──1:N── OrderItem (denormalized: stores productName + unitPrice snapshot)
Review (MongoDB document) — productId and userId as plain fields
```

### Key Pitfalls & Fixes

- **`Category.products` has `@JsonIgnore`** — without it, Jackson causes infinite recursion (`Category → products → Product.category → Category → ...`) → 500 error. Never remove this annotation.
- **`Product.imageUrls` is `List<String>` via `@ElementCollection(fetch=EAGER)`** stored in table `product_images`. The old `imageUrl` column still exists in `products` but is no longer read. If migrating from old data: `INSERT INTO product_images (product_id, image_url) SELECT id, image_url FROM products WHERE image_url IS NOT NULL AND image_url != '';`
- **`UserResponse` includes `role` (String) and nested `ProfileDto`** — `GET /auth/users/{id}` returns `{ id, firstName, lastName, email, role, profile: { phone, address, city, country } }`.
- **`ProductResponse` uses flat `categoryName: String`** — not a nested object. Frontend uses `product.categoryName`, not `product.category?.name`. Also uses `product.imageUrls` (array), not `product.imageUrl`.
- **No Spring Security filter chain** — only `BCryptPasswordEncoder` from `spring-security-crypto`. No JWT — userId is sent directly in API requests. Role enforcement is frontend-only (no backend auth on admin endpoints).
- **`deleteProduct`** calls `inventoryRepository.deleteByProductId(id)` before `productRepository.deleteById(id)` — the `inventories` table has a FK to `products` with no CASCADE, so the inventory row must be removed first or MySQL throws FK error 1451.
- **`deleteCategory`** calls `productRepository.detachCategory(id)` (single `@Modifying` JPQL query) before deleting — sets `category_id = NULL` for all affected products. Do not revert to the N+1 loop version.
- **`DataInitializer` `List.of()`** — uses immutable `List.of(...)` for seed image URLs. Hibernate replaces it with its own collection type on save, so this works. Do not change to mutable list unless there's a specific reason.
- **Dead column `products.image_url`** — this column still exists in MySQL but is no longer mapped by the entity (replaced by `product_images` table). It is harmless. To remove it: `ALTER TABLE products DROP COLUMN image_url;`
- **Image storage is local disk only** — `POST /upload` saves file bytes to `E-store/estore/uploads/` and returns a `localhost:8080` URL. The DB stores only the URL string. Teammates who clone the repo will have broken images unless they also receive the `uploads/` folder. To share a full working state: export the DB with `mysqldump -u root -p0000 estore_db > estore_db.sql` and zip `uploads/` together. New teammate: import the SQL dump, copy `uploads/`, start backend — images work immediately.

### Conventions

- **Lombok:** `@RequiredArgsConstructor` for constructor injection; `@Builder` + `@Data` on entities and DTOs. Use `@Builder.Default` for collection fields on `@Builder` entities.
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
│   ├── AdminNav.jsx         # Shared tab nav for all admin pages
│   ├── PrivateRoute.jsx     # Redirects to /login if no user in context
│   └── PrivateAdminRoute.jsx # Redirects to /login if user.role !== 'ADMIN'
└── features/
    ├── auth/                # LoginPage, RegisterPage
    ├── catalog/             # ProductListPage (search + filter), ProductDetailPage (image slider)
    ├── cart/                # CartPage (update qty, remove, checkout)
    ├── orders/              # OrderHistoryPage (expandable order details)
    ├── profile/             # ProfilePage (view/edit profile)
    └── admin/
        ├── AdminProductsPage.jsx    # List + delete products
        ├── AdminProductFormPage.jsx # Create/edit product with multi-image upload
        ├── AdminCategoriesPage.jsx  # Create + delete categories
        ├── AdminInventoryPage.jsx   # View + update stock levels
        └── AdminOrdersPage.jsx      # All orders + status management
```

**Auth flow:** Login response stores `{id, firstName, lastName, email, role, profile}` in `localStorage` under key `estore_user`. Check admin with `user.role === 'ADMIN'`. Admin routes are wrapped with `PrivateAdminRoute`. `AuthContext` exposes `loginUser`, `logoutUser`, and `updateUser(partial)` — `updateUser` merges a partial object into the stored user and re-persists to localStorage. `ProfilePage` calls `updateUser({ profile: form })` after a successful save so that the profile guard reacts immediately without re-login.

**API base URL:** `http://localhost:8080/api` — defined in `src/services/api.js`.

**Multi-image upload flow (AdminProductFormPage):**
- `uploadedUrls: string[]` — already-hosted URLs (loaded from product when editing)
- `stagedFiles: {file, preview}[]` — selected but not yet uploaded (shown with objectURL preview)
- On submit: each staged file is uploaded sequentially via `uploadImage()` → URLs combined → sent as `imageUrls` in payload
- Object URLs are revoked via `URL.revokeObjectURL` when a staged file is removed

**Image slider (ProductDetailPage):** `ImageSlider` component — uses `transform: translateX(-N*100%)` on a flex container. Only rendered when `images.length > 1`. Single image shows as plain `<img>`. No images shows emoji placeholder.

**Profile completion guard:** Before a client can add to cart (`ProductDetailPage`) or place an order (`CartPage`), the app checks `user.profile?.phone?.trim() && user.profile?.address?.trim()`. If incomplete, a yellow warning is shown with a link to `/profile`, and the checkout button is disabled. This check uses the in-memory context value (kept fresh by `updateUser`), not a fresh API call.

**Key data flow on checkout:** `CartPage` → `POST /api/orders` → backend deducts stock and clears cart atomically. After creating a product via admin form, `initInventory(productId, quantity)` is called automatically.

**Vite port conflict:** If port 5173 is in use, Vite auto-increments. Kill stale Node processes with `taskkill /IM node.exe /F` if needed.

### CSS Design System

`src/index.css` uses CSS custom properties (`--primary`, `--gray-*`, `--shadow-*`, `--radius`) defined in `:root`. All admin table styling uses classes `admin-table-wrap > table.admin-table` with `cell-id`, `cell-name`, `cell-price`, `badge-ok/low/rupture`. Do not use inline `style={{}}` for colors/spacing in admin pages — add to `index.css` instead.
