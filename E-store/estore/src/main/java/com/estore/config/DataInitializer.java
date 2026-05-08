package com.estore.config;

import com.estore.catalog.entity.Category;
import com.estore.catalog.entity.Product;
import com.estore.catalog.repository.CategoryRepository;
import com.estore.catalog.repository.ProductRepository;
import com.estore.customer.entity.User;
import com.estore.customer.repository.UserRepository;
import com.estore.inventory.entity.Inventory;
import com.estore.inventory.repository.InventoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final CategoryRepository  categoryRepository;
    private final ProductRepository   productRepository;
    private final InventoryRepository inventoryRepository;
    private final UserRepository      userRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Override
    public void run(String... args) {

        if (!userRepository.existsByEmail("admin@estore.com")) {
            userRepository.save(User.builder()
                    .firstName("Admin")
                    .lastName("E-Store")
                    .email("admin@estore.com")
                    .password(passwordEncoder.encode("admin123"))
                    .role(User.Role.ADMIN)
                    .build());
            System.out.println("✅ Compte admin créé : admin@estore.com / admin123");
        }

        if (categoryRepository.count() > 0) return;

        // ── Catégories ────────────────────────────────────────────────────────
        Category fournitures = categoryRepository.save(Category.builder()
                .name("Fournitures scolaires")
                .description("Tout le matériel pour bien étudier")
                .build());

        Category livres = categoryRepository.save(Category.builder()
                .name("Livres & Manuels")
                .description("Manuels universitaires et livres de référence")
                .build());

        Category informatique = categoryRepository.save(Category.builder()
                .name("Informatique étudiant")
                .description("Ordinateurs, tablettes et accessoires tech")
                .build());

        Category papeterie = categoryRepository.save(Category.builder()
                .name("Papeterie")
                .description("Papier, classeurs et organisation")
                .build());

        // ── Fournitures scolaires ─────────────────────────────────────────────
        Product sac = productRepository.save(Product.builder()
                .name("Sac à dos étudiant 30L")
                .description("Sac résistant avec compartiment laptop 15\", nombreuses poches, idéal pour la fac")
                .price(249.00)
                .imageUrls(List.of("https://via.placeholder.com/300x300?text=Sac+Etudiant"))
                .category(fournitures).build());

        Product cahiers = productRepository.save(Product.builder()
                .name("Lot de 10 cahiers grand format")
                .description("Cahiers 200 pages, grand format, réglure séyès — parfaits pour les cours")
                .price(89.00)
                .imageUrls(List.of("https://via.placeholder.com/300x300?text=Cahiers"))
                .category(fournitures).build());

        Product stylos = productRepository.save(Product.builder()
                .name("Stylos Bic cristal (boîte 20)")
                .description("Stylos bille bleus et noirs, écriture fluide, résistants")
                .price(45.00)
                .imageUrls(List.of("https://via.placeholder.com/300x300?text=Stylos+Bic"))
                .category(fournitures).build());

        Product geo = productRepository.save(Product.builder()
                .name("Kit géométrie complet")
                .description("Règle 30cm + équerre + rapporteur + compas — indispensable pour maths et physique")
                .price(55.00)
                .imageUrls(List.of("https://via.placeholder.com/300x300?text=Kit+Geometrie"))
                .category(fournitures).build());

        Product calculatrice = productRepository.save(Product.builder()
                .name("Calculatrice scientifique Casio FX-82")
                .description("Calculatrice scientifique 240 fonctions, idéale pour les examens universitaires")
                .price(299.00)
                .imageUrls(List.of("https://via.placeholder.com/300x300?text=Casio+FX-82"))
                .category(fournitures).build());

        // ── Livres & Manuels ──────────────────────────────────────────────────
        Product algoBook = productRepository.save(Product.builder()
                .name("Algorithmique et Structures de Données")
                .description("Cours complet d'algorithmique avec exercices corrigés, niveau Licence")
                .price(220.00)
                .imageUrls(List.of("https://via.placeholder.com/300x300?text=Algo+Livre"))
                .category(livres).build());

        Product webBook = productRepository.save(Product.builder()
                .name("Développement Web Full Stack")
                .description("HTML, CSS, JavaScript, React, Node.js — du débutant au confirmé")
                .price(280.00)
                .imageUrls(List.of("https://via.placeholder.com/300x300?text=Web+Livre"))
                .category(livres).build());

        Product dbBook = productRepository.save(Product.builder()
                .name("Bases de Données & SQL")
                .description("Modélisation relationnelle, SQL avancé, optimisation des requêtes")
                .price(195.00)
                .imageUrls(List.of("https://via.placeholder.com/300x300?text=BDD+Livre"))
                .category(livres).build());

        Product mathBook = productRepository.save(Product.builder()
                .name("Analyse Mathématique L2/L3")
                .description("Suites, séries, intégrales, équations différentielles avec exercices résolus")
                .price(175.00)
                .imageUrls(List.of("https://via.placeholder.com/300x300?text=Maths+Livre"))
                .category(livres).build());

        Product cleanCode = productRepository.save(Product.builder()
                .name("Clean Code — Robert C. Martin")
                .description("Les bonnes pratiques du développeur : code propre, maintenable et professionnel")
                .price(210.00)
                .imageUrls(List.of("https://via.placeholder.com/300x300?text=Clean+Code"))
                .category(livres).build());

        // ── Informatique étudiant ─────────────────────────────────────────────
        Product laptop = productRepository.save(Product.builder()
                .name("Laptop Lenovo IdeaPad 3 — i5 8GB")
                .description("Intel Core i5, 8GB RAM, 512GB SSD, écran 15.6\" Full HD — parfait pour les étudiants")
                .price(6499.00)
                .imageUrls(List.of("https://via.placeholder.com/300x300?text=Lenovo+IdeaPad"))
                .category(informatique).build());

        Product tablette = productRepository.save(Product.builder()
                .name("Tablette Samsung Galaxy Tab A8")
                .description("Écran 10.5\", 64GB, Android 12 — idéale pour prendre des notes et lire des cours PDF")
                .price(2199.00)
                .imageUrls(List.of("https://via.placeholder.com/300x300?text=Samsung+Tab+A8"))
                .category(informatique).build());

        Product souris = productRepository.save(Product.builder()
                .name("Souris sans fil Logitech M280")
                .description("Souris ergonomique, 3 ans de batterie, compatible Windows/Mac/Linux")
                .price(199.00)
                .imageUrls(List.of("https://via.placeholder.com/300x300?text=Souris+Logitech"))
                .category(informatique).build());

        Product cle = productRepository.save(Product.builder()
                .name("Clé USB 64GB Kingston")
                .description("USB 3.0 haute vitesse, compacte, idéale pour transférer cours et projets")
                .price(99.00)
                .imageUrls(List.of("https://via.placeholder.com/300x300?text=Cle+USB+64GB"))
                .category(informatique).build());

        Product casque = productRepository.save(Product.builder()
                .name("Casque audio JBL Tune 500")
                .description("Son puissant, confort longue durée, micro intégré — parfait pour les cours en ligne")
                .price(449.00)
                .imageUrls(List.of("https://via.placeholder.com/300x300?text=Casque+JBL"))
                .category(informatique).build());

        // ── Papeterie ──────────────────────────────────────────────────────────
        Product classeur = productRepository.save(Product.builder()
                .name("Classeur A4 à levier (lot de 5)")
                .description("Classeurs rigides 7cm dos large, idéals pour archiver les polycopiés et TD")
                .price(75.00)
                .imageUrls(List.of("https://via.placeholder.com/300x300?text=Classeurs+A4"))
                .category(papeterie).build());

        Product ramette = productRepository.save(Product.builder()
                .name("Ramette papier A4 — 500 feuilles")
                .description("Papier blanc 80g/m², qualité impression laser et jet d'encre")
                .price(65.00)
                .imageUrls(List.of("https://via.placeholder.com/300x300?text=Ramette+A4"))
                .category(papeterie).build());

        Product surligneurs = productRepository.save(Product.builder()
                .name("Surligneur Stabilo (set 6 couleurs)")
                .description("Surligneur fluorescent longue durée — indispensable pour réviser")
                .price(39.00)
                .imageUrls(List.of("https://via.placeholder.com/300x300?text=Surligneur+Stabilo"))
                .category(papeterie).build());

        Product agenda = productRepository.save(Product.builder()
                .name("Agenda universitaire 2025-2026")
                .description("Agenda semainier A5, vue semaine sur 2 pages, couverture rigide")
                .price(89.00)
                .imageUrls(List.of("https://via.placeholder.com/300x300?text=Agenda+Univ"))
                .category(papeterie).build());

        // ── Inventaire ────────────────────────────────────────────────────────
        inventoryRepository.save(Inventory.builder().product(sac).quantity(80).lowStockThreshold(10).build());
        inventoryRepository.save(Inventory.builder().product(cahiers).quantity(500).lowStockThreshold(50).build());
        inventoryRepository.save(Inventory.builder().product(stylos).quantity(300).lowStockThreshold(30).build());
        inventoryRepository.save(Inventory.builder().product(geo).quantity(150).lowStockThreshold(15).build());
        inventoryRepository.save(Inventory.builder().product(calculatrice).quantity(60).lowStockThreshold(5).build());

        inventoryRepository.save(Inventory.builder().product(algoBook).quantity(100).lowStockThreshold(10).build());
        inventoryRepository.save(Inventory.builder().product(webBook).quantity(80).lowStockThreshold(10).build());
        inventoryRepository.save(Inventory.builder().product(dbBook).quantity(90).lowStockThreshold(10).build());
        inventoryRepository.save(Inventory.builder().product(mathBook).quantity(120).lowStockThreshold(10).build());
        inventoryRepository.save(Inventory.builder().product(cleanCode).quantity(50).lowStockThreshold(5).build());

        inventoryRepository.save(Inventory.builder().product(laptop).quantity(25).lowStockThreshold(3).build());
        inventoryRepository.save(Inventory.builder().product(tablette).quantity(40).lowStockThreshold(5).build());
        inventoryRepository.save(Inventory.builder().product(souris).quantity(200).lowStockThreshold(20).build());
        inventoryRepository.save(Inventory.builder().product(cle).quantity(300).lowStockThreshold(30).build());
        inventoryRepository.save(Inventory.builder().product(casque).quantity(70).lowStockThreshold(8).build());

        inventoryRepository.save(Inventory.builder().product(classeur).quantity(250).lowStockThreshold(25).build());
        inventoryRepository.save(Inventory.builder().product(ramette).quantity(400).lowStockThreshold(40).build());
        inventoryRepository.save(Inventory.builder().product(surligneurs).quantity(350).lowStockThreshold(30).build());
        inventoryRepository.save(Inventory.builder().product(agenda).quantity(120).lowStockThreshold(15).build());

        System.out.println("✅ Catalogue académique inséré avec succès ! (19 produits, 4 catégories)");
    }
}
