package com.estore.billing.service;

import com.estore.billing.dto.*;
import java.util.List;

public interface BillingService {
    OrderResponse placeOrder(OrderRequest request);
    List<OrderResponse> getOrdersByUser(Long userId);
    OrderResponse getOrderById(Long orderId);
}
