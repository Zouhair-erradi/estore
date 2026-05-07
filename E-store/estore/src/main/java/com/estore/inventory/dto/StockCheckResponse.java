package com.estore.inventory.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockCheckResponse {
    private Long productId;
    private Integer requestedQuantity;
    private Integer availableQuantity;
    private boolean sufficient;
}
