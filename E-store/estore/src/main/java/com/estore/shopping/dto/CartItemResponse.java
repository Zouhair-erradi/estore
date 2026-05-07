package com.estore.shopping.dto;

import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class CartItemResponse {
    private Long itemId;
    private Long productId;
    private String productName;
    private Integer quantity;
    private Double unitPrice;
    private Double subtotal;
}
