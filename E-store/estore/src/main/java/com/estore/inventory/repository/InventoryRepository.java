package com.estore.inventory.repository;

import com.estore.inventory.entity.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Long> {

    // Trouver l'inventaire par l'ID du produit
    Optional<Inventory> findByProductId(Long productId);

    // Vérifier l'existence d'un inventaire pour un produit
    boolean existsByProductId(Long productId);

    void deleteByProductId(Long productId);

    // Lister les produits dont le stock est en dessous du seuil
    @Query("SELECT i FROM Inventory i WHERE i.quantity <= i.lowStockThreshold")
    List<Inventory> findLowStockItems();

    // Lister les produits en rupture de stock
    @Query("SELECT i FROM Inventory i WHERE i.quantity = 0")
    List<Inventory> findOutOfStockItems();

    // Lister les produits disponibles (quantité > 0)
    @Query("SELECT i FROM Inventory i WHERE i.quantity > 0")
    List<Inventory> findAvailableItems();
}
