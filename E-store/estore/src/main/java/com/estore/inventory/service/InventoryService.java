package com.estore.inventory.service;

import com.estore.inventory.dto.InventoryResponse;
import com.estore.inventory.dto.StockCheckResponse;
import com.estore.inventory.dto.StockDeductRequest;
import com.estore.inventory.dto.StockUpdateRequest;

import java.util.List;

public interface InventoryService {

    // ── Consultation ──────────────────────────────────────────────────────────

    /** Récupérer l'état du stock pour un produit donné */
    InventoryResponse getByProductId(Long productId);

    /** Lister tous les inventaires */
    List<InventoryResponse> getAll();

    /** Lister les produits avec stock faible */
    List<InventoryResponse> getLowStockItems();

    /** Lister les produits en rupture de stock */
    List<InventoryResponse> getOutOfStockItems();

    // ── Vérification (utilisée par Shopping) ─────────────────────────────────

    /** Vérifier si une quantité demandée est disponible */
    StockCheckResponse checkStock(Long productId, Integer requestedQuantity);

    /** Vérifier si au moins 1 unité est disponible */
    boolean isAvailable(Long productId);

    // ── Mise à jour ───────────────────────────────────────────────────────────

    /** Initialiser l'inventaire d'un nouveau produit */
    InventoryResponse initInventory(Long productId, Integer initialQuantity);

    /** Mettre à jour manuellement la quantité (admin) */
    InventoryResponse updateStock(Long productId, StockUpdateRequest request);

    /** Déduire une quantité du stock (appelé à la validation d'une commande) */
    void deductStock(StockDeductRequest request);

    /** Remettre en stock (ex: annulation de commande) */
    void restoreStock(StockDeductRequest request);
}
