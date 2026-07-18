package com.example.multi_tanent.tenant.base.controller;

import com.example.multi_tanent.tenant.base.dto.TimeTypeRequest;
import com.example.multi_tanent.tenant.base.entity.TimeType;
import com.example.multi_tanent.tenant.base.repository.TimeTypeRepository;
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
@RequestMapping("/api/time-types")
@CrossOrigin(origins = "*")
@Transactional(transactionManager = "tenantTx")
public class TimeTypeController {

    private final TimeTypeRepository timeTypeRepository;
    private final TenantModuleChecker moduleChecker;

    public TimeTypeController(TimeTypeRepository timeTypeRepository, TenantModuleChecker moduleChecker) {
        this.timeTypeRepository = timeTypeRepository;
        this.moduleChecker = moduleChecker;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HRMS_ADMIN','HR','MANAGER')")
    public ResponseEntity<?> createTimeType(@RequestBody TimeTypeRequest request) {
        if (timeTypeRepository.findByCode(request.getCode()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("A time type with the code '" + request.getCode() + "' already exists.");
        }
        if (timeTypeRepository.findByName(request.getName()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("A time type with the name '" + request.getName() + "' already exists.");
        }

        if (Boolean.TRUE.equals(request.getIsWorkingTime()) && Boolean.TRUE.equals(request.getIsUnpaidTime())) {
            return ResponseEntity.badRequest().body("A time type cannot be both Working Time and Unpaid Time.");
        }

        TimeType timeType = new TimeType();
        timeType.setCode(request.getCode());
        timeType.setName(request.getName());
        timeType.setNumericCode(request.getNumericCode());
        timeType.setIsWorkingTime(request.getIsWorkingTime() != null ? request.getIsWorkingTime() : false);
        timeType.setIsUnpaidTime(request.getIsUnpaidTime() != null ? request.getIsUnpaidTime() : false);

        TimeType savedTimeType = timeTypeRepository.save(timeType);

        URI location = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
                .buildAndExpand(savedTimeType.getId()).toUri();

        return ResponseEntity.created(location).body(savedTimeType);
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<TimeType>> getAllTimeTypes() {
        if (!moduleChecker.hasModule(ServiceModule.HRMS_CORE)) {
            return ResponseEntity.ok(java.util.Collections.emptyList());
        }
        return ResponseEntity.ok(timeTypeRepository.findAll());
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<TimeType> getTimeTypeById(@PathVariable Long id) {
        return timeTypeRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HRMS_ADMIN','HR','MANAGER')")
    public ResponseEntity<?> updateTimeType(@PathVariable Long id, @RequestBody TimeTypeRequest request) {
        Optional<TimeType> existingByCode = timeTypeRepository.findByCode(request.getCode());
        if (existingByCode.isPresent() && !existingByCode.get().getId().equals(id)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Another time type with the code '" + request.getCode() + "' already exists.");
        }
        Optional<TimeType> existingByName = timeTypeRepository.findByName(request.getName());
        if (existingByName.isPresent() && !existingByName.get().getId().equals(id)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Another time type with the name '" + request.getName() + "' already exists.");
        }

        if (Boolean.TRUE.equals(request.getIsWorkingTime()) && Boolean.TRUE.equals(request.getIsUnpaidTime())) {
            return ResponseEntity.badRequest().body("A time type cannot be both Working Time and Unpaid Time.");
        }

        return timeTypeRepository.findById(id)
                .map(timeType -> {
                    timeType.setCode(request.getCode());
                    timeType.setName(request.getName());
                    timeType.setNumericCode(request.getNumericCode());
                    timeType.setIsWorkingTime(request.getIsWorkingTime() != null ? request.getIsWorkingTime() : false);
                    timeType.setIsUnpaidTime(request.getIsUnpaidTime() != null ? request.getIsUnpaidTime() : false);
                    TimeType updatedTimeType = timeTypeRepository.save(timeType);
                    return ResponseEntity.ok(updatedTimeType);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HRMS_ADMIN','HR','MANAGER')")
    public ResponseEntity<Void> deleteTimeType(@PathVariable Long id) {
        return timeTypeRepository.findById(id)
                .map(timeType -> {
                    timeTypeRepository.delete(timeType);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
