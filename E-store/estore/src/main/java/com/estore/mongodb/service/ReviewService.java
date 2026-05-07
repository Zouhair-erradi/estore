package com.estore.mongodb.service;

import com.estore.mongodb.document.Review;
import com.estore.mongodb.dto.*;
import com.estore.mongodb.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;

    public ReviewResponse addReview(ReviewRequest request) {
        Review review = Review.builder()
                .productId(request.getProductId())
                .userId(request.getUserId())
                .authorName(request.getAuthorName())
                .rating(request.getRating())
                .comment(request.getComment())
                .build();

        return toResponse(reviewRepository.save(review));
    }

    public List<ReviewResponse> getByProduct(Long productId) {
        return reviewRepository.findByProductId(productId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    private ReviewResponse toResponse(Review r) {
        return ReviewResponse.builder()
                .id(r.getId())
                .productId(r.getProductId())
                .authorName(r.getAuthorName())
                .rating(r.getRating())
                .comment(r.getComment())
                .createdAt(r.getCreatedAt())
                .build();
    }
}
