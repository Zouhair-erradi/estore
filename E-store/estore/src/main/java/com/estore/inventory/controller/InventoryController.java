package com.estore.inventory.controller;

import com.estore.inventory.dto.InventoryResponse;
import com.estore.inventory.dto.StockCheckResponse;
import com.estore.inventory.dto.StockDeductRequest;
import com.estore.inventory.dto.StockUpdateRequest;
import com.estore.inventory.service.InventoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class InventoryController {

    private final InventoryService inventoryService;

    // ─── GET /api/inventory ────────────────────────────────────────────────
    // Lister tous les inventaires (admin)
    @GetMapping
    public ResponseEntity<List<InventoryResponse>> getAllInventory() {
        return ResponseEntity.ok(inventoryService.getAll());
    }

    // ─── GET /api/inventory/product/{productId} ────────────────────────────
    // Consulter le stock d'un produit
    @GetMapping("/product/{productId}")
    public ResponseEntity<InventoryResponse> getByProduct(@PathVariable Long productId) {
        return ResponseEntity.ok(inventoryService.getByProductId(productId));
    }

    // ─── GET /api/inventory/check?productId=1&quantity=3 ──────────────────
    // Vérifier si la quantité demandée est disponible (utilisé par Shopping)
    @GetMapping("/check")
    public ResponseEntity<StockCheckResponse> checkStock(
            @RequestParam Long productId,
            @RequestParam Integer quantity) {
        return ResponseEntity.ok(inventoryService.checkStock(productId, quantity));
    }

    // ─── GET /api/inventory/low-stock ─────────────────────────────────────
    // Lister les produits avec stock faible (admin)
    @GetMapping("/low-stock")
    public ResponseEntity<List<InventoryResponse>> getLowStock() {
        return ResponseEntity.ok(inventoryService.getLowStockItems());
    }

    // ─── GET /api/inventory/out-of-stock ──────────────────────────────────
    // Lister les produits en rupture de stock
    @GetMapping("/out-of-stock")
    public ResponseEntity<List<InventoryResponse>> getOutOfStock() {
        return ResponseEntity.ok(inventoryService.getOutOfStockItems());
    }

    // ─── POST /api/inventory/init/{productId}?quantity=50 ─────────────────
    // Initialiser le stock d'un nouveau produit (admin / Catalog domain)
    @PostMapping("/init/{productId}")
    public ResponseEntity<InventoryResponse> initInventory(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "0") Integer quantity) {
        InventoryResponse response = inventoryService.initInventory(productId, quantity);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // ─── PUT /api/inventory/product/{productId} ────────────────────────────
    // Mettre à jour manuellement le stock (admin)
    @PutMapping("/product/{productId}")
    public ResponseEntity<InventoryResponse> updateStock(
            @PathVariable Long productId,
            @Valid @RequestBody StockUpdateRequest request) {
        return ResponseEntity.ok(inventoryService.updateStock(productId, request));
    }

    // ─── POST /api/inventory/deduct ────────────────────────────────────────
    // Déduire du stock lors d'une commande (appelé par Billing domain)
    @PostMapping("/deduct")
    public ResponseEntity<Void> deductStock(@Valid @RequestBody StockDeductRequest request) {
        inventoryService.deductStock(request);
        return ResponseEntity.noContent().build();
    }

    // ─── POST /api/inventory/restore ──────────────────────────────────────
    // Remettre en stock (annulation de commande)
    @PostMapping("/restore")
    public ResponseEntity<Void> restoreStock(@Valid @RequestBody StockDeductRequest request) {
        inventoryService.restoreStock(request);
        return ResponseEntity.noContent().build();
    }
}
