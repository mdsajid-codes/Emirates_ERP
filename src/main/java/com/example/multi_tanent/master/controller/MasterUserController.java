package com.example.multi_tanent.master.controller;

import com.example.multi_tanent.master.dto.MasterUserRequest;
import com.example.multi_tanent.master.dto.MasterUserResponse;
import com.example.multi_tanent.master.entity.MasterUser;
import com.example.multi_tanent.master.enums.Role;
import com.example.multi_tanent.master.repository.MasterUserRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/master/users")
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('MASTER_ADMIN')")
public class MasterUserController {

    private final MasterUserRepository masterUserRepository;
    private final PasswordEncoder passwordEncoder;

    public MasterUserController(MasterUserRepository masterUserRepository, PasswordEncoder passwordEncoder) {
        this.masterUserRepository = masterUserRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping
    public ResponseEntity<?> createMasterUser(@Valid @RequestBody MasterUserRequest request) {
        if (masterUserRepository.findByUsername(request.getUsername()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Username '" + request.getUsername() + "' is already taken.");
        }

        MasterUser user = new MasterUser();
        user.setUsername(request.getUsername());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRoles(request.getRoles());

        MasterUser savedUser = masterUserRepository.save(user);

        URI location = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
                .buildAndExpand(savedUser.getId()).toUri();

        return ResponseEntity.created(location).body(MasterUserResponse.fromEntity(savedUser));
    }

    @GetMapping
    public ResponseEntity<List<MasterUserResponse>> getAllMasterUsers() {
        List<MasterUserResponse> users = masterUserRepository.findAll().stream()
                .map(MasterUserResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    @PutMapping("/{id}")
    public ResponseEntity<MasterUserResponse> updateMasterUser(@PathVariable Long id, @RequestBody MasterUserRequest request) {
        return masterUserRepository.findById(id)
                .map(user -> {
                    user.setUsername(request.getUsername());
                    user.setRoles(request.getRoles());
                    if (request.getPassword() != null && !request.getPassword().isEmpty()) {
                        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
                    }
                    return ResponseEntity.ok(MasterUserResponse.fromEntity(masterUserRepository.save(user)));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMasterUser(@PathVariable Long id) {
        return masterUserRepository.findById(id)
                .map(user -> {
                    // Prevent deleting the last MASTER_ADMIN
                    if (user.getRoles().contains(Role.MASTER_ADMIN)) {
                        long adminCount = masterUserRepository.findAll().stream()
                                .filter(u -> u.getRoles().contains(Role.MASTER_ADMIN))
                                .count();
                        if (adminCount <= 1) {
                            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                    .body("Cannot delete the last master admin.");
                        }
                    }
                    masterUserRepository.delete(user);
                    return ResponseEntity.noContent().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
