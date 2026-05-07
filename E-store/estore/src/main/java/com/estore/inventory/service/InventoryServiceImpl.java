package com.estore.inventory.service;

import com.estore.catalog.entity.Product;
import com.estore.catalog.repository.ProductRepository;
import com.estore.inventory.dto.InventoryResponse;
import com.estore.inventory.dto.StockCheckResponse;
import com.estore.inventory.dto.StockDeductRequest;
import com.estore.inventory.dto.StockUpdateRequest;
import com.estore.inventory.entity.Inventory;
import com.estore.inventory.repository.InventoryRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InventoryServiceImpl implements InventoryService {

    private final InventoryRepository inventoryRepository;
    private final ProductRepository   productRepository;

    // ── Consultation ──────────────────────────────────────────────────────────

    @Override
    public InventoryResponse getByProductId(Long productId) {
        Inventory inventory = findInventoryByProductId(productId);
        return toResponse(inventory);
    }

    @Override
    public List<InventoryResponse> getAll() {
        return inventoryRepository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<InventoryResponse> getLowStockItems() {
        return inventoryRepository.findLowStockItems()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<InventoryResponse> getOutOfStockItems() {
        return inventoryRepository.findOutOfStockItems()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ── Vérification ──────────────────────────────────────────────────────────

    @Override
    public StockCheckResponse checkStock(Long productId, Integer requestedQuantity) {
        Inventory inventory = findInventoryByProductId(productId);
        boolean sufficient = inventory.getQuantity() >= requestedQuantity;

        return StockCheckResponse.builder()
                .productId(productId)
                .requestedQuantity(requestedQuantity)
                .availableQuantity(inventory.getQuantity())
                .sufficient(sufficient)
                .build();
    }

    @Override
    public boolean isAvailable(Long productId) {
        Inventory inventory = findInventoryByProductId(productId);
        return inventory.getQuantity() > 0;
    }

    // ── Mise à jour ───────────────────────────────────────────────────────────

    @Override
    @Transactional
    public InventoryResponse initInventory(Long productId, Integer initialQuantity) {
        if (inventoryRepository.existsByProductId(productId)) {
            throw new IllegalStateException(
                "Un inventaire existe déjà pour le produit avec l'ID : " + productId);
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException(
                    "Produit introuvable avec l'ID : " + productId));

        Inventory inventory = Inventory.builder()
                .product(product)
                .quantity(initialQuantity)
                .lowStockThreshold(5)
                .build();

        return toResponse(inventoryRepository.save(inventory));
    }

    @Override
    @Transactional
    public InventoryResponse updateStock(Long productId, StockUpdateRequest request) {
        Inventory inventory = findInventoryByProductId(productId);
        inventory.setQuantity(request.getQuantity());
        return toResponse(inventoryRepository.save(inventory));
    }

    @Override
    @Transactional
    public void deductStock(StockDeductRequest request) {
        Inventory inventory = findInventoryByProductId(request.getProductId());

        if (inventory.getQuantity() < request.getQuantity()) {
            throw new IllegalStateException(
                "Stock insuffisant pour le produit ID " + request.getProductId()
                + ". Disponible : " + inventory.getQuantity()
                + ", demandé : " + request.getQuantity());
        }

        inventory.setQuantity(inventory.getQuantity() - request.getQuantity());
        inventoryRepository.save(inventory);
    }

    @Override
    @Transactional
    public void restoreStock(StockDeductRequest request) {
        Inventory inventory = findInventoryByProductId(request.getProductId());
        inventory.setQuantity(inventory.getQuantity() + request.getQuantity());
        inventoryRepository.save(inventory);
    }

    // ── Méthodes privées ──────────────────────────────────────────────────────

    private Inventory findInventoryByProductId(Long productId) {
        return inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException(
                    "Inventaire introuvable pour le produit ID : " + productId));
    }

    private InventoryResponse toResponse(Inventory inventory) {
        int qty = inventory.getQuantity();
        return InventoryResponse.builder()
                .id(inventory.getId())
                .productId(inventory.getProduct().getId())
                .productName(inventory.getProduct().getName())
                .quantity(qty)
                .lowStockThreshold(inventory.getLowStockThreshold())
                .available(qty > 0)
                .lowStock(qty > 0 && qty <= inventory.getLowStockThreshold())
                .build();
    }
}
