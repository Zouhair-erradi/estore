package com.estore.catalog.controller;

import com.estore.catalog.dto.*;
import com.estore.catalog.entity.Category;
import com.estore.catalog.service.CatalogService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CatalogController {

    private final CatalogService catalogService;

    // GET /api/products
    @GetMapping("/api/products")
    public ResponseEntity<List<ProductResponse>> getAllProducts(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long categoryId) {

        if (search != null)      return ResponseEntity.ok(catalogService.searchProducts(search));
        if (categoryId != null)  return ResponseEntity.ok(catalogService.getByCategory(categoryId));
        return ResponseEntity.ok(catalogService.getAllProducts());
    }

    // GET /api/products/{id}
    @GetMapping("/api/products/{id}")
    public ResponseEntity<ProductResponse> getProduct(@PathVariable Long id) {
        return ResponseEntity.ok(catalogService.getProductById(id));
    }

    // POST /api/products
    @PostMapping("/api/products")
    public ResponseEntity<ProductResponse> createProduct(@Valid @RequestBody ProductRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(catalogService.createProduct(request));
    }

    // PUT /api/products/{id}
    @PutMapping("/api/products/{id}")
    public ResponseEntity<ProductResponse> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductRequest request) {
        return ResponseEntity.ok(catalogService.updateProduct(id, request));
    }

    // DELETE /api/products/{id}
    @DeleteMapping("/api/products/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        catalogService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    // GET /api/categories
    @GetMapping("/api/categories")
    public ResponseEntity<List<Category>> getCategories() {
        return ResponseEntity.ok(catalogService.getAllCategories());
    }
}
