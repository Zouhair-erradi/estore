package com.estore.catalog.service;

import com.estore.catalog.dto.*;
import com.estore.catalog.entity.Category;
import java.util.List;

public interface CatalogService {
    List<ProductResponse> getAllProducts();
    ProductResponse getProductById(Long id);
    List<ProductResponse> searchProducts(String keyword);
    List<ProductResponse> getByCategory(Long categoryId);
    ProductResponse createProduct(ProductRequest request);
    ProductResponse updateProduct(Long id, ProductRequest request);
    void deleteProduct(Long id);
    List<Category> getAllCategories();
}
