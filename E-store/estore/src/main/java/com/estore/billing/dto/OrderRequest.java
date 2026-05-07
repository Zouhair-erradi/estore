package com.estore.billing.dto;

import lombok.*;
import java.util.List;

@Data @NoArgsConstructor @AllArgsConstructor
public class OrderRequest {
    private Long userId;
    private List<OrderItemRequest> items;
}
