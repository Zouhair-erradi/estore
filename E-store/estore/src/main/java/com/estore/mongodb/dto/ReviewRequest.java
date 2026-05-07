package com.estore.mongodb.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor
public class ReviewRequest {

    @NotNull(message = "Product ID obligatoire")
    private Long productId;

    @NotNull(message = "User ID obligatoire")
    private Long userId;

    @NotBlank(message = "Nom de l'auteur obligatoire")
    private String authorName;

    @NotNull @Min(1) @Max(5)
    private Integer rating;

    private String comment;
}
