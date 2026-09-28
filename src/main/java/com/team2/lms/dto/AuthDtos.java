package com.team2.lms.dto;

import jakarta.validation.constraints.NotBlank;

public class AuthDtos {
    public record RegisterRequest(
            @NotBlank String username,
            @NotBlank String password,
            @NotBlank String role) {}

    public record LoginRequest(
            @NotBlank String username,
            @NotBlank String password) {}

    public record AuthResponse(String token, String username, String role) {}
}
