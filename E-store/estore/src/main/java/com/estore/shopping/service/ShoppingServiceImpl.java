package com.estore.shopping.service;

import com.estore.shopping.dto.*;
import com.estore.shopping.entity.*;
import com.estore.shopping.repository.*;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ShoppingServiceImpl implements ShoppingService {

    private final CartRepository     cartRepository;
    private final CartItemRepository cartItemRepository;

    @Override
    public CartResponse getCart(Long userId) {
        Cart cart = getOrCreateCart(userId);
        return toResponse(cart);
    }

    @Override
    @Transactional
    public CartResponse addToCart(AddToCartRequest request) {
        Cart cart = getOrCreateCart(request.getUserId());

        // Si le produit existe déjà dans le panier → on additionne la quantité
        cartItemRepository.findByCartIdAndProductId(cart.getId(), request.getProductId())
                .ifPresentOrElse(
                    existing -> existing.setQuantity(existing.getQuantity() + request.getQuantity()),
                    () -> {
                        CartItem newItem = CartItem.builder()
                                .cart(cart)
                                .productId(request.getProductId())
                                .productName(request.getProductName())
                                .quantity(request.getQuantity())
                                .unitPrice(request.getUnitPrice())
                                .build();
                        cart.getItems().add(newItem);
                    }
                );

        return toResponse(cartRepository.save(cart));
    }

    @Override
    @Transactional
    public CartResponse updateQuantity(Long itemId, Integer quantity) {
        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new EntityNotFoundException("Article introuvable ID : " + itemId));

        if (quantity <= 0) {
            cartItemRepository.delete(item);
        } else {
            item.setQuantity(quantity);
            cartItemRepository.save(item);
        }

        return toResponse(item.getCart());
    }

    @Override
    @Transactional
    public void removeItem(Long itemId) {
        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new EntityNotFoundException("Article introuvable ID : " + itemId));
        cartItemRepository.delete(item);
    }

    @Override
    @Transactional
    public void clearCart(Long userId) {
        cartRepository.findByUserId(userId).ifPresent(cart -> {
            cart.getItems().clear();
            cartRepository.save(cart);
        });
    }

    // ── Privé ────────────────────────────────────────────────────────────────

    private Cart getOrCreateCart(Long userId) {
        return cartRepository.findByUserId(userId)
                .orElseGet(() -> cartRepository.save(Cart.builder().userId(userId).build()));
    }

    private CartResponse toResponse(Cart cart) {
        List<CartItemResponse> items = cart.getItems().stream()
                .map(i -> CartItemResponse.builder()
                        .itemId(i.getId())
                        .productId(i.getProductId())
                        .productName(i.getProductName())
                        .quantity(i.getQuantity())
                        .unitPrice(i.getUnitPrice())
                        .subtotal(i.getQuantity() * i.getUnitPrice())
                        .build())
                .collect(Collectors.toList());

        double total = items.stream().mapToDouble(CartItemResponse::getSubtotal).sum();

        return CartResponse.builder()
                .cartId(cart.getId())
                .userId(cart.getUserId())
                .items(items)
                .total(total)
                .build();
    }
}
