package com.estore.shopping.service;

import com.estore.shopping.dto.*;

public interface ShoppingService {
    CartResponse getCart(Long userId);
    CartResponse addToCart(AddToCartRequest request);
    CartResponse updateQuantity(Long itemId, Integer quantity);
    void removeItem(Long itemId);
    void clearCart(Long userId);
}
