package com.team2.lms.controller;

import com.team2.lms.dto.AuthDtos.*;
import com.team2.lms.entity.User;
import com.team2.lms.repository.UserRepository;
import com.team2.lms.security.JwtService;
import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final JwtService jwtService;

    public AuthController(UserRepository users, PasswordEncoder encoder, JwtService jwtService) {
        this.users = users; this.encoder = encoder; this.jwtService = jwtService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        if (users.existsByUsername(request.username()))
            return ResponseEntity.badRequest().body("Username already exists");

        String role = request.role().toUpperCase();
        try { com.team2.lms.entity.Role.valueOf(role); }
        catch (IllegalArgumentException e) { return ResponseEntity.badRequest().body("Invalid role"); }

        User user = User.builder().username(request.username())
                .password(encoder.encode(request.password()))
                .role(role).build();
        users.save(user);
        return ResponseEntity.status(HttpStatus.CREATED).body("User registered successfully");
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        User user = users.findByUsername(request.username())
                .orElseThrow(() -> new RuntimeException("Invalid username or password"));

        if (!encoder.matches(request.password(), user.getPassword()))
            throw new RuntimeException("Invalid username or password");

        return new AuthResponse(jwtService.generateToken(user.getUsername(), user.getRole()),
                user.getUsername(), user.getRole());
    }
}
