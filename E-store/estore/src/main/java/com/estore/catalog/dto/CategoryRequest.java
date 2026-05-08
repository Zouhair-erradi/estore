package com.estore.catalog.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor
public class CategoryRequest {
    @NotBlank
    private String name;
    private String description;
}
