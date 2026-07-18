package com.example.multi_tanent.tenant.base.controller;

import com.example.multi_tanent.tenant.base.dto.WorkTypeRequest;
import com.example.multi_tanent.tenant.base.entity.WorkType;
import com.example.multi_tanent.tenant.base.repository.WorkTypeRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;
import java.util.Optional;

import com.example.multi_tanent.master.entity.ServiceModule;
import com.example.multi_tanent.master.service.TenantModuleChecker;

@RestController
@RequestMapping("/api/work-types")
@CrossOrigin(origins = "*")
@Transactional(transactionManager = "tenantTx")
public class WorkTypeController {

    private final WorkTypeRepository workTypeRepository;
    private final TenantModuleChecker moduleChecker;

    public WorkTypeController(WorkTypeRepository workTypeRepository, TenantModuleChecker moduleChecker) {
        this.workTypeRepository = workTypeRepository;
        this.moduleChecker = moduleChecker;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HRMS_ADMIN','HR','MANAGER')")
    public ResponseEntity<?> createWorkType(@RequestBody WorkTypeRequest request) {
        if (workTypeRepository.findByCode(request.getCode()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("A work type with the code '" + request.getCode() + "' already exists.");
        }
        if (workTypeRepository.findByName(request.getName()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("A work type with the name '" + request.getName() + "' already exists.");
        }

        WorkType workType = new WorkType();
        workType.setCode(request.getCode());
        workType.setName(request.getName());

        WorkType savedWorkType = workTypeRepository.save(workType);

        URI location = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
                .buildAndExpand(savedWorkType.getId()).toUri();

        return ResponseEntity.created(location).body(savedWorkType);
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<WorkType>> getAllWorkTypes() {
        if (!moduleChecker.hasModule(ServiceModule.HRMS_CORE)) {
            return ResponseEntity.ok(java.util.Collections.emptyList());
        }
        return ResponseEntity.ok(workTypeRepository.findAll());
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<WorkType> getWorkTypeById(@PathVariable Long id) {
        return workTypeRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HRMS_ADMIN','HR','MANAGER')")
    public ResponseEntity<?> updateWorkType(@PathVariable Long id, @RequestBody WorkTypeRequest request) {
        Optional<WorkType> existingByCode = workTypeRepository.findByCode(request.getCode());
        if (existingByCode.isPresent() && !existingByCode.get().getId().equals(id)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Another work type with the code '" + request.getCode() + "' already exists.");
        }
        Optional<WorkType> existingByName = workTypeRepository.findByName(request.getName());
        if (existingByName.isPresent() && !existingByName.get().getId().equals(id)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Another work type with the name '" + request.getName() + "' already exists.");
        }

        return workTypeRepository.findById(id)
                .map(workType -> {
                    workType.setCode(request.getCode());
                    workType.setName(request.getName());
                    WorkType updatedWorkType = workTypeRepository.save(workType);
                    return ResponseEntity.ok(updatedWorkType);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HRMS_ADMIN','HR','MANAGER')")
    public ResponseEntity<Void> deleteWorkType(@PathVariable Long id) {
        return workTypeRepository.findById(id)
                .map(workType -> {
                    workTypeRepository.delete(workType);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
