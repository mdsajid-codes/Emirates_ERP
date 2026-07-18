package com.example.multi_tanent.master.controller;

import com.example.multi_tanent.master.dto.MasterAuthRequest;
import com.example.multi_tanent.master.enums.Role;
import com.example.multi_tanent.master.entity.MasterUser;
import com.example.multi_tanent.master.repository.MasterUserRepository;
import com.example.multi_tanent.security.JwtUtil;
import com.example.multi_tanent.spersusers.dto.LoginResponse;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/master/auth")
@CrossOrigin(origins = "*")
public class MasterAuthController {
  private final MasterUserRepository repo;
  private final PasswordEncoder encoder;
  private final JwtUtil jwt;

  public MasterAuthController(MasterUserRepository repo, PasswordEncoder encoder, JwtUtil jwt) {
    this.repo = repo; this.encoder = encoder; this.jwt = jwt;
  }

  @PostMapping("/login")
  public ResponseEntity<LoginResponse> login(@RequestBody MasterAuthRequest masterAuthRequest) {
    MasterUser user = repo.findByUsername(masterAuthRequest.getUsername())
            .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.UNAUTHORIZED, "Invalid username or password."));

    if (!encoder.matches(masterAuthRequest.getPassword(), user.getPasswordHash())) {
        throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.UNAUTHORIZED, "Invalid username or password.");
    }

    // Correctly get roles from the user object and convert them to a list of strings.
    List<String> roles = user.getRoles().stream()
            .map(Role::name)
            .collect(Collectors.toList());

    String token = jwt.generateToken(user.getUsername(), "master", roles);
    return ResponseEntity.ok(new LoginResponse(token, roles, null, null));
  }
}