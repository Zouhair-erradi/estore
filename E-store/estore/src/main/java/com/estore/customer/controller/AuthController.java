package com.estore.customer.controller;

import com.estore.customer.dto.*;
import com.estore.customer.service.CustomerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {

    private final CustomerService customerService;

    // POST /api/auth/register
    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(customerService.register(request));
    }

    // POST /api/auth/login
    @PostMapping("/login")
    public ResponseEntity<UserResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(customerService.login(request));
    }

    // GET /api/auth/users/{id}
    @GetMapping("/users/{id}")
    public ResponseEntity<UserResponse> getUser(@PathVariable Long id) {
        return ResponseEntity.ok(customerService.getById(id));
    }

    // PUT /api/auth/users/{id}/profile
    @PutMapping("/users/{id}/profile")
    public ResponseEntity<UserResponse> updateProfile(
            @PathVariable Long id,
            @RequestBody ProfileRequest request) {
        return ResponseEntity.ok(customerService.updateProfile(id, request));
    }
}
