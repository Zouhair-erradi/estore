package com.estore.inventory.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryResponse {
    private Long id;
    private Long productId;
    private String productName;
    private Integer quantity;
    private Integer lowStockThreshold;
    private boolean available;
    private boolean lowStock;
}
