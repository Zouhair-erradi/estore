package com.estore.customer.dto;

import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class ProfileDto {
    private String phone;
    private String address;
    private String city;
    private String country;
}
