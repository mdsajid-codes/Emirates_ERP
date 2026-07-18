package com.example.multi_tanent.tenant.base.controller;

import java.net.URI;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.example.multi_tanent.tenant.base.dto.DesignationRequest;
import com.example.multi_tanent.tenant.base.dto.DesignationResponse;
import com.example.multi_tanent.tenant.base.entity.Designation;
import com.example.multi_tanent.tenant.base.repository.DepartmentRepository;
import com.example.multi_tanent.tenant.base.repository.DesignationRepository;

import com.example.multi_tanent.master.entity.ServiceModule;
import com.example.multi_tanent.master.service.TenantModuleChecker;

@RestController
@RequestMapping("/api/designations")
@CrossOrigin(origins = "*")
@Transactional(transactionManager = "tenantTx")
public class DesignationController {
    private final DesignationRepository designationRepository;
    private final DepartmentRepository departmentRepository;
    private final TenantModuleChecker moduleChecker;

    public DesignationController(DesignationRepository designationRepository, DepartmentRepository departmentRepository, TenantModuleChecker moduleChecker){
        this.designationRepository = designationRepository;
        this.departmentRepository = departmentRepository;
        this.moduleChecker = moduleChecker;
    }

    @PostMapping("/for-department/{departmentCode}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HRMS_ADMIN','HR','MANAGER')")
    public ResponseEntity<?> createDesignation(@PathVariable String departmentCode, @RequestBody DesignationRequest designationRequest){
        return departmentRepository.findByCode(departmentCode)
            .map(department -> {
                if (designationRepository.findByDepartmentIdAndTitle(department.getId(), designationRequest.getTitle()).isPresent()) {
                    return ResponseEntity.status(HttpStatus.CONFLICT)
                            .body("A designation with the title '" + designationRequest.getTitle() + "' already exists in this department.");
                }

                Designation designation = new Designation();
                designation.setDepartment(department);
                designation.setTitle(designationRequest.getTitle());
                designation.setLevel(designationRequest.getLevel());
                designation.setDescription(designationRequest.getDescription());
                designation.setCreatedAt(LocalDateTime.now());
                designation.setUpdatedAt(LocalDateTime.now());
                Designation savedDesignation = designationRepository.save(designation);

                URI location = ServletUriComponentsBuilder.fromCurrentContextPath().path("/api/designations/{id}")
                                .buildAndExpand(savedDesignation.getId()).toUri();
                
                return ResponseEntity.created(location).body(DesignationResponse.fromEntity(savedDesignation));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public ResponseEntity<List<DesignationResponse>> getAllDesignations(){
        if (!moduleChecker.hasModule(ServiceModule.HRMS_CORE)) {
            return ResponseEntity.ok(java.util.Collections.emptyList());
        }
        List<DesignationResponse> responses = designationRepository.findAll().stream()
                .map(DesignationResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DesignationResponse> getDesignationById(@PathVariable Long id) {
        return designationRepository.findById(id)
            .map(designation -> ResponseEntity.ok(DesignationResponse.fromEntity(designation)))
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/for-department/{departmentCode}")
    public ResponseEntity<List<DesignationResponse>> getDesignationsByDepartment(@PathVariable String departmentCode) {
        return departmentRepository.findByCode(departmentCode)
                .map(department -> {
                    List<DesignationResponse> designations = designationRepository.findByDepartmentId(department.getId())
                            .stream()
                            .map(DesignationResponse::fromEntity)
                            .collect(Collectors.toList());
                    return ResponseEntity.ok(designations);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HRMS_ADMIN','HR','MANAGER')")
    public ResponseEntity<?> updateDesignation(@PathVariable Long id, @RequestBody DesignationRequest designationRequest){
        return designationRepository.findById(id)
            .map(designation -> {
                Optional<Designation> existing = designationRepository.findByDepartmentIdAndTitle(designation.getDepartment().getId(), designationRequest.getTitle());
                if (existing.isPresent() && !existing.get().getId().equals(id)) {
                    return ResponseEntity.status(HttpStatus.CONFLICT)
                            .body("Another designation with the title '" + designationRequest.getTitle() + "' already exists in this department.");
                }

                designation.setTitle(designationRequest.getTitle());
                designation.setLevel(designationRequest.getLevel());
                designation.setDescription(designationRequest.getDescription());
                designation.setUpdatedAt(LocalDateTime.now());
                Designation updatedDesignation = designationRepository.save(designation);
                return ResponseEntity.ok(DesignationResponse.fromEntity(updatedDesignation));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HRMS_ADMIN','HR','MANAGER')")
    public ResponseEntity<Void> deleteDesignation(@PathVariable Long id){
        return designationRepository.findById(id)
            .map(designation -> {
                designationRepository.delete(designation);
                return ResponseEntity.noContent().<Void>build();
            })
            .orElse(ResponseEntity.notFound().build());
    }
}
