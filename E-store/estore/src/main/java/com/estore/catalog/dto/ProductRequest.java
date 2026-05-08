package com.estore.catalog.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Data @NoArgsConstructor @AllArgsConstructor
public class ProductRequest {

    @NotBlank(message = "Nom obligatoire")
    private String name;

    private String description;

    @NotNull(message = "Prix obligatoire")
    @Positive(message = "Le prix doit être positif")
    private Double price;

    private List<String> imageUrls = new ArrayList<>();

    @NotNull(message = "Catégorie obligatoire")
    private Long categoryId;
}
