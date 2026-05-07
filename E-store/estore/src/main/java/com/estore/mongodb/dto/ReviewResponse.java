package com.estore.mongodb.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class ReviewResponse {
    private String id;
    private Long productId;
    private String authorName;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;
}
