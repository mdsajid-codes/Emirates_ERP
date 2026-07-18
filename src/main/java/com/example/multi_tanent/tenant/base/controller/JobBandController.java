package com.example.multi_tanent.tenant.base.controller;

import com.example.multi_tanent.tenant.base.dto.JobBandRequest;
import com.example.multi_tanent.tenant.base.dto.JobBandResponse;
import com.example.multi_tanent.tenant.base.entity.JobBand;
import com.example.multi_tanent.tenant.base.repository.DesignationRepository;
import com.example.multi_tanent.tenant.base.repository.JobBandRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import com.example.multi_tanent.master.entity.ServiceModule;
import com.example.multi_tanent.master.service.TenantModuleChecker;

@RestController
@RequestMapping("/api/jobBands")
@CrossOrigin(origins = "*")
@Transactional(transactionManager = "tenantTx")
public class JobBandController {

    private final JobBandRepository jobBandRepository;
    private final DesignationRepository designationRepository;
    private final TenantModuleChecker moduleChecker;

    public JobBandController(JobBandRepository jobBandRepository, DesignationRepository designationRepository, TenantModuleChecker moduleChecker) {
        this.jobBandRepository = jobBandRepository;
        this.designationRepository = designationRepository;
        this.moduleChecker = moduleChecker;
    }

    @PostMapping("/for-designation/{designationId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HRMS_ADMIN','HR','MANAGER')")
    public ResponseEntity<?> createJobBand(@PathVariable Long designationId, @RequestBody JobBandRequest jobBandRequest) {
        if (jobBandRepository.findByName(jobBandRequest.getName()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("A JobBand with the name '" + jobBandRequest.getName() + "' already exists.");
        }

        return designationRepository.findById(designationId)
                .map(designation -> {
                    if (jobBandRepository.findByDesignationId(designationId).isPresent()) {
                        return ResponseEntity.status(HttpStatus.CONFLICT)
                                .body("A JobBand already exists for this designation. Please update the existing one.");
                    }

                    JobBand jobBand = new JobBand();
                    jobBand.setDesignation(designation);
                    jobBand.setName(jobBandRequest.getName());
                    jobBand.setLevel(jobBandRequest.getLevel());
                    jobBand.setMinSalary(jobBandRequest.getMinSalary());
                    jobBand.setMaxSalary(jobBandRequest.getMaxSalary());
                    jobBand.setNotes(jobBandRequest.getNotes());

                    JobBand savedJobBand = jobBandRepository.save(jobBand);

                    URI location = ServletUriComponentsBuilder.fromCurrentContextPath().path("/api/jobBands/{id}")
                            .buildAndExpand(savedJobBand.getId()).toUri();

                    return ResponseEntity.created(location).body(JobBandResponse.fromEntity(savedJobBand));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public ResponseEntity<List<JobBandResponse>> getAllJobBands() {
        if (!moduleChecker.hasModule(ServiceModule.HRMS_CORE)) {
            return ResponseEntity.ok(java.util.Collections.emptyList());
        }
        List<JobBandResponse> responses = jobBandRepository.findAll().stream()
                .map(JobBandResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobBandResponse> getJobBandById(@PathVariable Long id) {
        return jobBandRepository.findById(id)
                .map(jobBand -> ResponseEntity.ok(JobBandResponse.fromEntity(jobBand)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HRMS_ADMIN','HR','MANAGER')")
    public ResponseEntity<?> updateJobBand(@PathVariable Long id, @RequestBody JobBandRequest jobBandRequest) {
        Optional<JobBand> existingJobBandWithSameName = jobBandRepository.findByName(jobBandRequest.getName());
        if (existingJobBandWithSameName.isPresent() && !existingJobBandWithSameName.get().getId().equals(id)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("A JobBand with the name '" + jobBandRequest.getName() + "' already exists.");
        }

        return jobBandRepository.findById(id)
                .map(jobBand -> {
                    jobBand.setName(jobBandRequest.getName());
                    jobBand.setLevel(jobBandRequest.getLevel());
                    jobBand.setMinSalary(jobBandRequest.getMinSalary());
                    jobBand.setMaxSalary(jobBandRequest.getMaxSalary());
                    jobBand.setNotes(jobBandRequest.getNotes());
                    JobBand updatedJobBand = jobBandRepository.save(jobBand);
                    return ResponseEntity.ok(JobBandResponse.fromEntity(updatedJobBand));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HRMS_ADMIN','HR','MANAGER')")
    public ResponseEntity<Void> deleteJobBand(@PathVariable Long id) {
        return jobBandRepository.findById(id)
                .map(jobBand -> {
                    jobBandRepository.delete(jobBand);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
