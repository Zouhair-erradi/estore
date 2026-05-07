package com.estore.shopping.controller;

import com.estore.shopping.dto.*;
import com.estore.shopping.service.ShoppingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CartController {

    private final ShoppingService shoppingService;

    // GET /api/cart/{userId}
    @GetMapping("/{userId}")
    public ResponseEntity<CartResponse> getCart(@PathVariable Long userId) {
        return ResponseEntity.ok(shoppingService.getCart(userId));
    }

    // POST /api/cart/add
    @PostMapping("/add")
    public ResponseEntity<CartResponse> addToCart(@Valid @RequestBody AddToCartRequest request) {
        return ResponseEntity.ok(shoppingService.addToCart(request));
    }

    // PUT /api/cart/update/{itemId}?quantity=2
    @PutMapping("/update/{itemId}")
    public ResponseEntity<CartResponse> updateQuantity(
            @PathVariable Long itemId,
            @RequestParam Integer quantity) {
        return ResponseEntity.ok(shoppingService.updateQuantity(itemId, quantity));
    }

    // DELETE /api/cart/remove/{itemId}
    @DeleteMapping("/remove/{itemId}")
    public ResponseEntity<Void> removeItem(@PathVariable Long itemId) {
        shoppingService.removeItem(itemId);
        return ResponseEntity.noContent().build();
    }

    // DELETE /api/cart/clear/{userId}
    @DeleteMapping("/clear/{userId}")
    public ResponseEntity<Void> clearCart(@PathVariable Long userId) {
        shoppingService.clearCart(userId);
        return ResponseEntity.noContent().build();
    }
}
