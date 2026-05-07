package com.estore.shopping.dto;

import jakarta.validation.constraints.*;
import lombok.*;
import java.util.List;

// ── AddToCartRequest ─────────────────────────────────────────────────────────
@Data @NoArgsConstructor @AllArgsConstructor
public class AddToCartRequest {
    @NotNull private Long userId;
    @NotNull private Long productId;
    @NotNull @Min(1) private Integer quantity;
    @NotNull @Positive private Double unitPrice;
    private String productName;
}
