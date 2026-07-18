package com.example.multi_tanent.tenant.base.controller;

import com.example.multi_tanent.tenant.base.dto.WeeklyOffPolicyRequest;
import com.example.multi_tanent.tenant.base.entity.WeeklyOffPolicy;
import com.example.multi_tanent.tenant.base.repository.WeeklyOffPolicyRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/weekly-off-policies")
@CrossOrigin(origins = "*")
@Transactional(transactionManager = "tenantTx")
public class WeekOffPolicyController {

    private final WeeklyOffPolicyRepository weeklyOffPolicyRepository;

    public WeekOffPolicyController(WeeklyOffPolicyRepository weeklyOffPolicyRepository) {
        this.weeklyOffPolicyRepository = weeklyOffPolicyRepository;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HRMS_ADMIN','HR','MANAGER')")
    public ResponseEntity<?> createWeeklyOffPolicy(@RequestBody WeeklyOffPolicyRequest request) {
        if (weeklyOffPolicyRepository.findByCode(request.getCode()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("A weekly off policy with the code '" + request.getCode() + "' already exists.");
        }
        if (weeklyOffPolicyRepository.findByName(request.getName()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("A weekly off policy with the name '" + request.getName() + "' already exists.");
        }

        WeeklyOffPolicy policy = new WeeklyOffPolicy();
        policy.setCode(request.getCode());
        policy.setName(request.getName());
        policy.setOffDays(request.getOffDays());
        policy.setRotate(request.getRotate() != null && request.getRotate());

        WeeklyOffPolicy savedPolicy = weeklyOffPolicyRepository.save(policy);

        URI location = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
                .buildAndExpand(savedPolicy.getId()).toUri();

        return ResponseEntity.created(location).body(savedPolicy);
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<WeeklyOffPolicy>> getAllWeeklyOffPolicies() {
        return ResponseEntity.ok(weeklyOffPolicyRepository.findAll());
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<WeeklyOffPolicy> getWeeklyOffPolicyById(@PathVariable Long id) {
        return weeklyOffPolicyRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HRMS_ADMIN','HR','MANAGER')")
    public ResponseEntity<?> updateWeeklyOffPolicy(@PathVariable Long id, @RequestBody WeeklyOffPolicyRequest request) {
        Optional<WeeklyOffPolicy> existingByCode = weeklyOffPolicyRepository.findByCode(request.getCode());
        if (existingByCode.isPresent() && !existingByCode.get().getId().equals(id)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Another weekly off policy with the code '" + request.getCode() + "' already exists.");
        }
        Optional<WeeklyOffPolicy> existingByName = weeklyOffPolicyRepository.findByName(request.getName());
        if (existingByName.isPresent() && !existingByName.get().getId().equals(id)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Another weekly off policy with the name '" + request.getName() + "' already exists.");
        }

        return weeklyOffPolicyRepository.findById(id)
                .map(policy -> {
                    policy.setCode(request.getCode());
                    policy.setName(request.getName());
                    policy.setOffDays(request.getOffDays());
                    policy.setRotate(request.getRotate() != null && request.getRotate());
                    WeeklyOffPolicy updatedPolicy = weeklyOffPolicyRepository.save(policy);
                    return ResponseEntity.ok(updatedPolicy);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HRMS_ADMIN','HR','MANAGER')")
    public ResponseEntity<Void> deleteWeeklyOffPolicy(@PathVariable Long id) {
        return weeklyOffPolicyRepository.findById(id)
                .map(policy -> {
                    weeklyOffPolicyRepository.delete(policy);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
