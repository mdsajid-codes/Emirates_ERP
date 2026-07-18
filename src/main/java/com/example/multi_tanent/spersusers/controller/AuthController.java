package com.example.multi_tanent.spersusers.controller;

import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.master.entity.MasterTenant;
import com.example.multi_tanent.master.entity.SubscriptionStatus;
import com.example.multi_tanent.master.entity.ServiceModule;
import com.example.multi_tanent.master.repository.MasterTenantRepository;
import com.example.multi_tanent.security.JwtUtil;
import com.example.multi_tanent.spersusers.dto.LoginRequest;
import com.example.multi_tanent.spersusers.dto.LoginResponse;
import com.example.multi_tanent.spersusers.enitity.User;
import com.example.multi_tanent.spersusers.repository.UserRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;
import com.example.multi_tanent.spersusers.repository.ThemeRepository;
import com.example.multi_tanent.spersusers.dto.ThemeResponse;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final MasterTenantRepository masterTenantRepository;
    private final ThemeRepository themeRepository;

    public AuthController(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil, MasterTenantRepository masterTenantRepository, ThemeRepository themeRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.masterTenantRepository = masterTenantRepository;
        this.themeRepository = themeRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest loginRequest) {
        TenantContext.setTenantId(loginRequest.getTenantId());
 
        MasterTenant masterTenant = masterTenantRepository.findByTenantId(loginRequest.getTenantId())
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.UNAUTHORIZED, "Tenant configuration not found."));
 
        if (masterTenant.getStatus() != SubscriptionStatus.ACTIVE) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.FORBIDDEN, "Your subscription is not active. Please contact support. Status: " + masterTenant.getStatus());
        }
 
        User user = userRepository.findByEmail(loginRequest.getEmail())
                .filter(u -> passwordEncoder.matches(loginRequest.getPassword(), u.getPasswordHash()))
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.UNAUTHORIZED, "Invalid credentials or tenant ID."));

        List<String> roles = user.getRoles().stream().map(Enum::name).collect(Collectors.toList());
        List<ServiceModule> modules = masterTenant.getServiceModules();

        String token = jwtUtil.generateToken(user.getEmail(), loginRequest.getTenantId(), roles);
        ThemeResponse theme = themeRepository.findFirstByIsActiveTrue().map(ThemeResponse::fromEntity).orElse(null);

        return ResponseEntity.ok(new LoginResponse(token, roles, modules, theme));
    }
}
