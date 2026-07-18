package com.example.multi_tanent.tenant.employee.controller;

import com.example.multi_tanent.spersusers.repository.LocationRepository;
import com.example.multi_tanent.tenant.employee.dto.JobDetailsResponse;
import com.example.multi_tanent.tenant.employee.dto.JobDetailsRequest;
import com.example.multi_tanent.tenant.employee.entity.JobDetails;
import com.example.multi_tanent.tenant.employee.repository.EmployeeRepository;
import com.example.multi_tanent.tenant.employee.repository.JobDetailsRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;
import java.util.stream.Collectors;

import com.example.multi_tanent.master.entity.ServiceModule;
import com.example.multi_tanent.master.service.TenantModuleChecker;

@RestController
@RequestMapping("/api/job-details")
@CrossOrigin(origins = "*")
@Transactional(transactionManager = "tenantTx")
public class JobDetailsController {

    private final EmployeeRepository employeeRepository;
    private final JobDetailsRepository jobDetailsRepository;
    private final LocationRepository locationRepository;
    private final TenantModuleChecker moduleChecker;

    public JobDetailsController(EmployeeRepository employeeRepository, JobDetailsRepository jobDetailsRepository, LocationRepository locationRepository, TenantModuleChecker moduleChecker) {
        this.employeeRepository = employeeRepository;
        this.jobDetailsRepository = jobDetailsRepository;
        this.locationRepository = locationRepository;
        this.moduleChecker = moduleChecker;
    }

    @PutMapping("/{employeeCode}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HRMS_ADMIN','HR','MANAGER')")
    public ResponseEntity<JobDetailsResponse> createOrUpdateJobDetails(@PathVariable String employeeCode, @RequestBody JobDetailsRequest request) {
        if (!moduleChecker.hasModule(ServiceModule.HRMS_CORE)) {
            return ResponseEntity.ok(new JobDetailsResponse());
        }
        return employeeRepository.findByEmployeeCode(employeeCode)
                .map(employee -> {
                    JobDetails jobDetails = jobDetailsRepository.findByEmployeeId(employee.getId())
                            .orElse(new JobDetails());

                    boolean isNew = jobDetails.getId() == null;
                    if (isNew) {
                        jobDetails.setEmployee(employee);
                    }

                    updateJobDetailsFromRequest(jobDetails, request);
                    JobDetails savedJobDetails = jobDetailsRepository.save(jobDetails);

                    if (isNew) {
                        URI location = ServletUriComponentsBuilder.fromCurrentContextPath()
                                .path("/api/job-details/{employeeCode}")
                                .buildAndExpand(employeeCode).toUri();
                        return ResponseEntity.created(location).body(JobDetailsResponse.fromEntity(savedJobDetails));
                    } else {
                        return ResponseEntity.ok(JobDetailsResponse.fromEntity(savedJobDetails));
                    }
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HRMS_ADMIN','HR','MANAGER')")
    @Transactional(readOnly = true)
    public ResponseEntity<List<JobDetailsResponse>> getAll(){
        if (!moduleChecker.hasModule(ServiceModule.HRMS_CORE)) {
            return ResponseEntity.ok(java.util.Collections.emptyList());
        }
        List<JobDetailsResponse> allJobDetails = jobDetailsRepository.findAll().stream()
                .map(JobDetailsResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(allJobDetails);
    }

    @GetMapping("/{employeeCode}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<JobDetailsResponse> getJobDetails(@PathVariable String employeeCode) {
        if (!moduleChecker.hasModule(ServiceModule.HRMS_CORE)) {
            return ResponseEntity.notFound().build();
        }
        return employeeRepository.findByEmployeeCode(employeeCode)
                .flatMap(employee -> jobDetailsRepository.findByEmployeeId(employee.getId()))
                .map(jobDetails -> ResponseEntity.ok(JobDetailsResponse.fromEntity(jobDetails)))
                .orElse(ResponseEntity.notFound().build());
    }

    private void updateJobDetailsFromRequest(JobDetails jobDetails, JobDetailsRequest request) {
        if (request.getLocationId() != null) {
            locationRepository.findById(request.getLocationId())
                    .ifPresentOrElse(jobDetails::setLocation,
                            () -> { throw new EntityNotFoundException("Location not found with id: " + request.getLocationId()); });
        }
        jobDetails.setActualLocation(request.getActualLocation());
        jobDetails.setDepartment(request.getDepartment());
        jobDetails.setDesignation(request.getDesignation());
        jobDetails.setJobBand(request.getJobBand());
        jobDetails.setReportsTo(request.getReportsTo());
        jobDetails.setDateOfJoining(request.getDateOfJoining());
        jobDetails.setProbationEndDate(request.getProbationEndDate());
        jobDetails.setLoginId(request.getLoginId());
        jobDetails.setProfileName(request.getProfileName());
        jobDetails.setEmployeeNumber(request.getEmployeeNumber());
        jobDetails.setLegalEntity(request.getLegalEntity());
        jobDetails.setContractType(request.getContractType());
    }
}
