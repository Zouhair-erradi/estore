package com.estore.billing.dto;

import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor
public class OrderItemRequest {
    private Long productId;
    private String productName;
    private Integer quantity;
    private Double unitPrice;
}
