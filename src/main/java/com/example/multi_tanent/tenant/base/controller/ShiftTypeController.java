package com.example.multi_tanent.tenant.base.controller;

import com.example.multi_tanent.tenant.base.dto.ShiftTypeRequest;
import com.example.multi_tanent.tenant.base.entity.ShiftType;
import com.example.multi_tanent.tenant.base.repository.ShiftTypeRepository;
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
@RequestMapping("/api/shift-types")
@CrossOrigin(origins = "*")
@Transactional(transactionManager = "tenantTx")
public class ShiftTypeController {

    private final ShiftTypeRepository shiftTypeRepository;

    public ShiftTypeController(ShiftTypeRepository shiftTypeRepository) {
        this.shiftTypeRepository = shiftTypeRepository;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HRMS_ADMIN','HR','MANAGER')")
    public ResponseEntity<?> createShiftType(@RequestBody ShiftTypeRequest request) {
        if (shiftTypeRepository.findByCode(request.getCode()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("A shift type with the code '" + request.getCode() + "' already exists.");
        }
        if (shiftTypeRepository.findByName(request.getName()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("A shift type with the name '" + request.getName() + "' already exists.");
        }

        ShiftType shiftType = new ShiftType();
        shiftType.setCode(request.getCode());
        shiftType.setName(request.getName());
        shiftType.setStartTime(request.getStartTime());
        shiftType.setEndTime(request.getEndTime());
        shiftType.setBreakMinutes(request.getBreakMinutes() != null ? request.getBreakMinutes() : 0);
        shiftType.setNightShift(request.getIsNightShift() != null ? request.getIsNightShift() : false);

        ShiftType savedShiftType = shiftTypeRepository.save(shiftType);

        URI location = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
                .buildAndExpand(savedShiftType.getId()).toUri();

        return ResponseEntity.created(location).body(savedShiftType);
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ShiftType>> getAllShiftTypes() {
        return ResponseEntity.ok(shiftTypeRepository.findAll());
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ShiftType> getShiftTypeById(@PathVariable Long id) {
        return shiftTypeRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HRMS_ADMIN','HR','MANAGER')")
    public ResponseEntity<?> updateShiftType(@PathVariable Long id, @RequestBody ShiftTypeRequest request) {
        Optional<ShiftType> existingByCode = shiftTypeRepository.findByCode(request.getCode());
        if (existingByCode.isPresent() && !existingByCode.get().getId().equals(id)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Another shift type with the code '" + request.getCode() + "' already exists.");
        }
        Optional<ShiftType> existingByName = shiftTypeRepository.findByName(request.getName());
        if (existingByName.isPresent() && !existingByName.get().getId().equals(id)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Another shift type with the name '" + request.getName() + "' already exists.");
        }

        return shiftTypeRepository.findById(id)
                .map(shiftType -> {
                    shiftType.setCode(request.getCode());
                    shiftType.setName(request.getName());
                    shiftType.setStartTime(request.getStartTime());
                    shiftType.setEndTime(request.getEndTime());
                    shiftType.setBreakMinutes(request.getBreakMinutes() != null ? request.getBreakMinutes() : 0);
                    shiftType.setNightShift(request.getIsNightShift() != null ? request.getIsNightShift() : false);
                    ShiftType updatedShiftType = shiftTypeRepository.save(shiftType);
                    return ResponseEntity.ok(updatedShiftType);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HRMS_ADMIN','HR','MANAGER')")
    public ResponseEntity<Void> deleteShiftType(@PathVariable Long id) {
        return shiftTypeRepository.findById(id)
                .map(shiftType -> {
                    shiftTypeRepository.delete(shiftType);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
