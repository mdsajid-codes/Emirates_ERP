package com.example.multi_tanent.tenant.base.controller;

import java.net.URI;
import java.time.LocalDateTime;
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

import com.example.multi_tanent.tenant.base.dto.DepartmentRequest;
import com.example.multi_tanent.tenant.base.entity.Department;
import com.example.multi_tanent.tenant.base.repository.DepartmentRepository;

import com.example.multi_tanent.master.entity.ServiceModule;
import com.example.multi_tanent.master.service.TenantModuleChecker;

@RestController
@RequestMapping("/api/departments")
@CrossOrigin(origins = "*")
@Transactional(transactionManager = "tenantTx")
public class DepartmentController {

    private final DepartmentRepository departmentRepository;
    private final TenantModuleChecker moduleChecker;

    public DepartmentController(DepartmentRepository departmentRepository, TenantModuleChecker moduleChecker) {
        this.departmentRepository = departmentRepository;
        this.moduleChecker = moduleChecker;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HRMS_ADMIN','HR','MANAGER')")
    public ResponseEntity<?> createDepartment(@RequestBody DepartmentRequest request){
        if (departmentRepository.findByName(request.getName()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("A department with the name '" + request.getName() + "' already exists.");
        }
        if (departmentRepository.findByCode(request.getCode()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("A department with the code '" + request.getCode() + "' already exists.");
        }

        Department department = new Department();
        department.setName(request.getName());
        department.setCode(request.getCode());
        department.setDescription(request.getDescription());
        department.setCreatedAt(LocalDateTime.now());
        department.setUpdatedAt(LocalDateTime.now());
        Department savedDepartment = departmentRepository.save(department);

        URI location = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
            .buildAndExpand(savedDepartment.getId()).toUri();

        return ResponseEntity.created(location).body(savedDepartment);
    }

    @GetMapping
    public ResponseEntity<List<Department>> getAllDepartments(){
        if (!moduleChecker.hasModule(ServiceModule.HRMS_CORE)) {
            return ResponseEntity.ok(java.util.Collections.emptyList());
        }
        return ResponseEntity.ok(departmentRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Department> getDepartmentById(@PathVariable Long id) {
        return departmentRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HRMS_ADMIN','HR','MANAGER')")
    public ResponseEntity<?> updateDepartment(@PathVariable Long id, @RequestBody DepartmentRequest departmentRequest){
        if (departmentRepository.findByName(departmentRequest.getName())
                .filter(d -> !d.getId().equals(id))
                .isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Another department with the name '" + departmentRequest.getName() + "' already exists.");
        }
        if (departmentRepository.findByCode(departmentRequest.getCode())
                .filter(d -> !d.getId().equals(id))
                .isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Another department with the code '" + departmentRequest.getCode() + "' already exists.");
        }

        return departmentRepository.findById(id)
            .map(department -> {
                department.setName(departmentRequest.getName());
                department.setCode(departmentRequest.getCode());
                department.setDescription(departmentRequest.getDescription());
                department.setUpdatedAt(LocalDateTime.now());
                Department updatedDepartment = departmentRepository.save(department);
                return ResponseEntity.ok(updatedDepartment);
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HRMS_ADMIN','HR','MANAGER')")
    public ResponseEntity<Void> deleteDepartment(@PathVariable Long id){
        return departmentRepository.findById(id)
            .map(department -> {
                departmentRepository.delete(department);
                return ResponseEntity.noContent().<Void>build();
            })
            .orElse(ResponseEntity.notFound().build());
    }
}
