package com.estore.billing.service;

import com.estore.billing.dto.*;
import com.estore.billing.entity.*;
import com.estore.billing.repository.OrderRepository;
import com.estore.inventory.dto.StockDeductRequest;
import com.estore.inventory.service.InventoryService;
import com.estore.shopping.service.ShoppingService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BillingServiceImpl implements BillingService {

    private final OrderRepository orderRepository;
    private final InventoryService inventoryService;
    private final ShoppingService shoppingService;

    @Override
    @Transactional
    public OrderResponse placeOrder(OrderRequest request) {
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new IllegalStateException("Le panier est vide, impossible de commander.");
        }

        // Construire les lignes de commande
        List<OrderItem> orderItems = request.getItems().stream()
                .map(i -> OrderItem.builder()
                        .productId(i.getProductId())
                        .productName(i.getProductName())
                        .quantity(i.getQuantity())
                        .unitPrice(i.getUnitPrice())
                        .build())
                .collect(Collectors.toList());

        // Calcul du total
        double total = orderItems.stream()
                .mapToDouble(i -> i.getQuantity() * i.getUnitPrice())
                .sum();

        Order order = Order.builder()
                .userId(request.getUserId())
                .totalAmount(total)
                .status(Order.OrderStatus.PENDING)
                .items(orderItems)
                .build();

        // Lier chaque ligne à la commande
        orderItems.forEach(item -> item.setOrder(order));

        Order saved = orderRepository.save(order);

        // Déduire le stock pour chaque ligne
        orderItems.forEach(item ->
                inventoryService.deductStock(new StockDeductRequest(item.getProductId(), item.getQuantity()))
        );

        // Vider le panier après validation
        shoppingService.clearCart(request.getUserId());

        return toResponse(saved);
    }

    @Override
    public List<OrderResponse> getOrdersByUser(Long userId) {
        return orderRepository.findByUserIdOrderByOrderDateDesc(userId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    public OrderResponse getOrderById(Long orderId) {
        return toResponse(orderRepository.findById(orderId)
                .orElseThrow(() -> new EntityNotFoundException("Commande introuvable ID : " + orderId)));
    }

    private OrderResponse toResponse(Order order) {
        List<OrderItemResponse> items = order.getItems().stream()
                .map(i -> OrderItemResponse.builder()
                        .id(i.getId())
                        .productId(i.getProductId())
                        .productName(i.getProductName())
                        .quantity(i.getQuantity())
                        .unitPrice(i.getUnitPrice())
                        .subtotal(i.getQuantity() * i.getUnitPrice())
                        .build())
                .collect(Collectors.toList());

        return OrderResponse.builder()
                .id(order.getId())
                .userId(order.getUserId())
                .orderDate(order.getOrderDate())
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus().name())
                .items(items)
                .build();
    }
}
