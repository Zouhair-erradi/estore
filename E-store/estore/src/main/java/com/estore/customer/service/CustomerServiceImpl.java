package com.estore.customer.service;

import com.estore.customer.dto.*;
import com.estore.customer.entity.Profile;
import com.estore.customer.entity.User;
import com.estore.customer.repository.ProfileRepository;
import com.estore.customer.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomerServiceImpl implements CustomerService {

    private final UserRepository    userRepository;
    private final ProfileRepository profileRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Override
    @Transactional
    public UserResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalStateException("Email déjà utilisé : " + request.getEmail());
        }

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .build();

        User saved = userRepository.save(user);

        // Créer un profil vide par défaut
        Profile profile = Profile.builder().user(saved).build();
        profileRepository.save(profile);

        return toResponse(saved);
    }

    @Override
    public UserResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new EntityNotFoundException("Utilisateur introuvable"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalStateException("Mot de passe incorrect");
        }

        return toResponse(user);
    }

    @Override
    public UserResponse getById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Utilisateur introuvable ID : " + id));
        return toResponse(user);
    }

    @Override
    @Transactional
    public UserResponse updateProfile(Long userId, ProfileRequest request) {
        Profile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new EntityNotFoundException("Profil introuvable pour user ID : " + userId));

        profile.setPhone(request.getPhone());
        profile.setAddress(request.getAddress());
        profile.setCity(request.getCity());
        profile.setCountry(request.getCountry());
        profileRepository.save(profile);

        return toResponse(profile.getUser());
    }

    private UserResponse toResponse(User user) {
        ProfileDto profileDto = profileRepository.findByUserId(user.getId())
                .map(p -> ProfileDto.builder()
                        .phone(p.getPhone())
                        .address(p.getAddress())
                        .city(p.getCity())
                        .country(p.getCountry())
                        .build())
                .orElse(null);

        return UserResponse.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .profile(profileDto)
                .build();
    }
}
