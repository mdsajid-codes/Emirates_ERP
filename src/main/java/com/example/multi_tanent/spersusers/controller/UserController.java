package com.example.multi_tanent.spersusers.controller;

import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.master.entity.MasterTenant;
import com.example.multi_tanent.spersusers.dto.UserRegisterRequest;
import com.example.multi_tanent.spersusers.enitity.Location;
import com.example.multi_tanent.spersusers.enitity.Store;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.enitity.User;
import com.example.multi_tanent.spersusers.repository.UserRepository;
import com.example.multi_tanent.spersusers.repository.LocationRepository;
import com.example.multi_tanent.master.repository.MasterTenantRepository;
import com.example.multi_tanent.tenant.base.dto.UserResponse;
import com.example.multi_tanent.tenant.base.dto.UserUpdateRequest;

import jakarta.validation.Valid;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
@Transactional(transactionManager = "tenantTx")
public class UserController { 
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JpaRepository<Tenant, Long> tenantRepository; // Use generic repo to avoid circular dependency
    private final JpaRepository<Store, Long> storeRepository;   // Use generic repo
    private final LocationRepository locationRepository;
    private final MasterTenantRepository masterTenantRepository;

    public UserController(UserRepository userRepository, PasswordEncoder passwordEncoder, JpaRepository<Tenant, Long> tenantRepository, JpaRepository<Store, Long> storeRepository, LocationRepository locationRepository, MasterTenantRepository masterTenantRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tenantRepository = tenantRepository;
        this.storeRepository = storeRepository;
        this.locationRepository = locationRepository;
        this.masterTenantRepository = masterTenantRepository;
    }

    @PostMapping("/register")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HRMS_ADMIN', 'POS_ADMIN')")
    public ResponseEntity<?> createUser(@Valid @RequestBody UserRegisterRequest request) { // Changed from UserRequest to UserRegisterRequest
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("User with email '" + request.getEmail() + "' already exists.");
        }

        String tenantId = TenantContext.getTenantId();
        MasterTenant masterTenant = masterTenantRepository.findByTenantId(tenantId)
                .orElseThrow(() -> new IllegalStateException("Master tenant record not found. Cannot enforce subscription limits."));

        Integer userLimit = masterTenant.getNumberOfUsers();
        if (userLimit != null) {
            long currentUserCount = userRepository.count();
            if (currentUserCount >= userLimit) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("User limit of " + userLimit + " has been reached for your subscription.");
            }
        }

        // 1. Fetch the Tenant for the current context. There should only be one.
        Tenant tenant = tenantRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new IllegalStateException("Tenant record not found in the current database. Provisioning may be incomplete."));

        // 2. Fetch the Store if storeId is provided
        Store store = null;
        if (request.getStoreId() != null) {
            Optional<Store> storeOpt = storeRepository.findById(request.getStoreId());
            if (storeOpt.isEmpty()) {
                return ResponseEntity.badRequest().body("Store with id '" + request.getStoreId() + "' not found.");
            }
            store = storeOpt.get();
        }

        // 3. Fetch the Location if locationId is provided
        Location userLocation = null;
        if (request.getLocationId() != null) {
            Optional<Location> locationOpt = locationRepository.findById(request.getLocationId());
            if (locationOpt.isEmpty()) {
                return ResponseEntity.badRequest().body("Location with id '" + request.getLocationId() + "' not found.");
            }
            userLocation = locationOpt.get();
        }

        User user = new User();
        user.setTenant(tenant);
        user.setStore(store);
        user.setLocation(userLocation);

        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword())); // Ensure password is set from UserRegisterRequest
        user.setRoles(request.getRoles());
        user.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);
        user.setIsLocked(request.getIsLocked() != null ? request.getIsLocked() : false);
        user.setLoginAttempts(0);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        User savedUser = userRepository.save(user);

        URI location = ServletUriComponentsBuilder
                .fromCurrentContextPath().path("/api/users/{id}")
                .buildAndExpand(savedUser.getId()).toUri();

        return ResponseEntity.created(location).body(UserResponse.fromEntity(savedUser));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HRMS_ADMIN', 'POS_ADMIN')")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        List<UserResponse> users = userRepository.findAll().stream()
                .map(UserResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HRMS_ADMIN', 'POS_ADMIN')")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(user -> ResponseEntity.ok(UserResponse.fromEntity(user)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HRMS_ADMIN', 'POS_ADMIN')")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @Valid @RequestBody UserUpdateRequest request) {
        return userRepository.findById(id)
                .map(user -> {
                    boolean updated = false;

                    if (request.getName() != null) {
                        user.setName(request.getName());
                        updated = true;
                    }
                    if (request.getRoles() != null && !request.getRoles().isEmpty()) {
                        user.setRoles(request.getRoles());
                        updated = true;
                    }
                    if (request.getIsActive() != null) {
                        user.setIsActive(request.getIsActive());
                        updated = true;
                    }
                    if (request.getStoreId() != null) {
                        Store store = storeRepository.findById(request.getStoreId()).orElse(null); // Fix: Pass Long directly
                        user.setStore(store);
                        updated = true;
                    }
                    if (request.getLocationId() != null) {
                        Location userLocation = locationRepository.findById(request.getLocationId()).orElse(null);
                        user.setLocation(userLocation);
                        updated = true;
                    }
                    // Update password if provided
                    if (request.getPassword() != null && !request.getPassword().toString().isBlank()) {
                        user.setPasswordHash(passwordEncoder.encode(request.getPassword().toString()));
                        updated = true;
                    }

                    user.setUpdatedAt(LocalDateTime.now()); // Always update the timestamp
                    User savedUser = userRepository.save(user);
                    return ResponseEntity.ok(UserResponse.fromEntity(savedUser));
                }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HRMS_ADMIN', 'POS_ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
