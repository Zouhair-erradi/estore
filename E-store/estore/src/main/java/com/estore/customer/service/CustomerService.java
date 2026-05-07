package com.estore.customer.service;

import com.estore.customer.dto.*;

public interface CustomerService {
    UserResponse register(RegisterRequest request);
    UserResponse login(LoginRequest request);
    UserResponse getById(Long id);
    UserResponse updateProfile(Long userId, ProfileRequest request);
}
