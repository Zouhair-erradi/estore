package com.estore.mongodb.document;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "reviews")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Review {

    @Id
    private String id;

    private Long productId;
    private Long userId;
    private String authorName;

    private Integer rating;   // 1 à 5
    private String comment;

    private LocalDateTime createdAt = LocalDateTime.now();
}
