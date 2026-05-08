package com.estore.catalog.dto;

import lombok.*;

import java.util.List;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class ProductResponse {
    private Long id;
    private String name;
    private String description;
    private Double price;
    private List<String> imageUrls;
    private Long categoryId;
    private String categoryName;
}
