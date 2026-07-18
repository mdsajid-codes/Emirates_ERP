package com.example.multi_tanent.materials.service.impl;

import com.example.multi_tanent.materials.dto.MaterialIndentDetailRequest;
import com.example.multi_tanent.materials.dto.MaterialIndentRequest;
import com.example.multi_tanent.materials.dto.MaterialIndentResponse;
import com.example.multi_tanent.materials.entity.MaterialIndent;
import com.example.multi_tanent.materials.entity.MaterialIndentDetail;
import com.example.multi_tanent.materials.entity.MaterialRequision;
import com.example.multi_tanent.materials.repository.MaterialIndentRepository;
import com.example.multi_tanent.materials.repository.MaterialRequisionRepository;
import com.example.multi_tanent.materials.service.MaterialIndentService;
import com.example.multi_tanent.production.entity.ProProcess;
import com.example.multi_tanent.production.entity.ProRawMaterials;
import com.example.multi_tanent.production.repository.ProProcessRepository;
import com.example.multi_tanent.production.repository.ProRawMaterialsRepository;
import com.example.multi_tanent.spersusers.enitity.Location;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.LocationRepository;

import com.example.multi_tanent.spersusers.repository.TenantRepository;
import com.example.multi_tanent.tenant.employee.repository.EmployeeRepository;
import com.example.multi_tanent.tenant.base.repository.DepartmentRepository;
import com.example.multi_tanent.spersusers.enitity.Employee;
import com.example.multi_tanent.tenant.base.entity.Department;
import com.example.multi_tanent.config.TenantContext;
import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.hibernate.Hibernate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MaterialIndentServiceImpl implements MaterialIndentService {

        private final MaterialIndentRepository materialIndentRepository;
        private final MaterialRequisionRepository materialRequisionRepository;
        private final ProRawMaterialsRepository proRawMaterialsRepository;
        private final ProProcessRepository proProcessRepository;
        private final LocationRepository locationRepository;

        private final EmployeeRepository employeeRepository;
        private final DepartmentRepository departmentRepository;
        private final TenantRepository tenantRepository;
        private final jakarta.persistence.EntityManager entityManager;

        @Override
        @Transactional
        public MaterialIndentResponse create(MaterialIndentRequest request, HttpServletRequest httpRequest) {
                String tenantIdStr = TenantContext.getTenantId();
                Tenant tenant = tenantRepository.findByTenantId(tenantIdStr)
                                .orElseThrow(() -> new EntityNotFoundException("Tenant not found"));

                MaterialRequision materialRequisition = null;
                if (request.getMaterialRequisitionId() != null) {
                        materialRequisition = materialRequisionRepository
                                        .findByIdAndTenant(request.getMaterialRequisitionId(), tenant)
                                        .orElseThrow(() -> new EntityNotFoundException(
                                                        "Material Requisition not found"));
                }

                Location location = null;
                if (request.getLocationId() != null) {
                        location = locationRepository.findById(request.getLocationId())
                                        .orElseThrow(() -> new EntityNotFoundException("Location not found"));
                }

                Employee employee = null;
                if (request.getEmployeeId() != null) {
                        employee = employeeRepository.findById(request.getEmployeeId())
                                        .orElseThrow(() -> new EntityNotFoundException("Employee not found"));
                }

                Department department = null;
                if (request.getDepartmentId() != null) {
                        department = departmentRepository.findById(request.getDepartmentId())
                                        .orElseThrow(() -> new EntityNotFoundException("Department not found"));
                }

                MaterialIndent materialIndent = MaterialIndent.builder()
                                .tenant(tenant)
                                .indentNo("INDENT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                                .indentDate(request.getIndentDate())
                                .materialRequisition(materialRequisition)
                                .location(location)
                                .employee(employee)
                                .department(department)
                                .status(request.getStatus())
                                .remarks(request.getRemarks())
                                .details(new ArrayList<>())
                                .build();

                if (request.getDetails() != null) {
                        for (MaterialIndentDetailRequest detailRequest : request.getDetails()) {
                                ProRawMaterials rawMaterial = proRawMaterialsRepository
                                                .findByIdAndTenant(detailRequest.getRawMaterialId(), tenant)
                                                .orElseThrow(() -> new EntityNotFoundException(
                                                                "Raw Material not found: "
                                                                                + detailRequest.getRawMaterialId()));

                                ProProcess process = null;
                                if (detailRequest.getProcessId() != null) {
                                        process = proProcessRepository
                                                        .findByIdAndTenant(detailRequest.getProcessId(), tenant)
                                                        .orElseThrow(() -> new EntityNotFoundException(
                                                                        "Process not found: " + detailRequest
                                                                                        .getProcessId()));
                                }

                                MaterialIndentDetail detail = MaterialIndentDetail.builder()
                                                .materialIndent(materialIndent)
                                                .rawMaterial(rawMaterial)
                                                .process(process)
                                                .indentQuantity(detailRequest.getIndentQuantity())
                                                .remarks(detailRequest.getRemarks())
                                                .additionalDescription(detailRequest.getAdditionalDescription())
                                                .build();
                                materialIndent.getDetails().add(detail);
                        }
                }

                MaterialIndent savedIndent = materialIndentRepository.save(materialIndent);
                return MaterialIndentResponse.fromEntity(savedIndent);
        }

        @Override
        @Transactional
        public MaterialIndentResponse update(Long id, MaterialIndentRequest request,
                        HttpServletRequest httpRequest) {
                String tenantIdStr = TenantContext.getTenantId();
                Tenant tenant = tenantRepository.findByTenantId(tenantIdStr)
                                .orElseThrow(() -> new EntityNotFoundException("Tenant not found"));

                MaterialIndent materialIndent = materialIndentRepository.findByIdAndTenant(id, tenant)
                                .orElseThrow(() -> new EntityNotFoundException("Material Indent not found"));

                if (request.getMaterialRequisitionId() != null) {
                        MaterialRequision materialRequisition = materialRequisionRepository
                                        .findByIdAndTenant(request.getMaterialRequisitionId(), tenant)
                                        .orElseThrow(() -> new EntityNotFoundException(
                                                        "Material Requisition not found"));
                        materialIndent.setMaterialRequisition(materialRequisition);
                }

                if (request.getLocationId() != null) {
                        Location location = locationRepository.findById(request.getLocationId())
                                        .orElseThrow(() -> new EntityNotFoundException("Location not found"));
                        materialIndent.setLocation(location);
                }

                if (request.getEmployeeId() != null) {
                        Employee employee = employeeRepository.findById(request.getEmployeeId())
                                        .orElseThrow(() -> new EntityNotFoundException("Employee not found"));
                        materialIndent.setEmployee(employee);
                }

                if (request.getDepartmentId() != null) {
                        Department department = departmentRepository.findById(request.getDepartmentId())
                                        .orElseThrow(() -> new EntityNotFoundException("Department not found"));
                        materialIndent.setDepartment(department);
                }

                if (request.getIndentDate() != null)
                        materialIndent.setIndentDate(request.getIndentDate());
                if (request.getStatus() != null)
                        materialIndent.setStatus(request.getStatus());
                if (request.getRemarks() != null)
                        materialIndent.setRemarks(request.getRemarks());

                if (request.getApprovalStatus() != null)
                        materialIndent.setApprovalStatus(request.getApprovalStatus());
                if (request.getCreatePoStatus() != null)
                        materialIndent.setCreatePoStatus(request.getCreatePoStatus());
                if (request.getApprovedDate() != null)
                        materialIndent.setApprovedDate(request.getApprovedDate());

                if (request.getApprovedById() != null) {
                        Employee approvedBy = employeeRepository.findById(request.getApprovedById())
                                        .orElseThrow(() -> new EntityNotFoundException(
                                                        "Approved By Employee not found"));
                        materialIndent.setApprovedBy(approvedBy);
                }

                if (request.getDetails() != null) {
                        java.util.List<MaterialIndentDetailRequest> incomingRequests = request.getDetails();
                        java.util.List<MaterialIndentDetail> currentDetails = materialIndent.getDetails();
                        java.util.List<MaterialIndentDetail> detailsToAdd = new ArrayList<>();
                        java.util.Set<Long> matchedDetailIds = new java.util.HashSet<>();

                        // 1. Update existing and Identify new ones
                        for (MaterialIndentDetailRequest req : incomingRequests) {
                                boolean matched = false;
                                for (MaterialIndentDetail existing : currentDetails) {
                                        if (matchedDetailIds.contains(existing.getId()))
                                                continue;

                                        Long existingRawMatId = existing.getRawMaterial().getId();
                                        Long reqRawMatId = req.getRawMaterialId();
                                        Long existingProcessId = existing.getProcess() != null
                                                        ? existing.getProcess().getId()
                                                        : null;
                                        Long reqProcessId = req.getProcessId();

                                        boolean rawMatMatch = existingRawMatId.equals(reqRawMatId);
                                        boolean processMatch = (existingProcessId == null && reqProcessId == null)
                                                        || (existingProcessId != null
                                                                        && existingProcessId.equals(reqProcessId));

                                        if (rawMatMatch && processMatch) {
                                                existing.setIndentQuantity(req.getIndentQuantity());
                                                existing.setRemarks(req.getRemarks());
                                                existing.setAdditionalDescription(req.getAdditionalDescription());
                                                matchedDetailIds.add(existing.getId());
                                                matched = true;
                                                break;
                                        }
                                }

                                if (!matched) {
                                        ProRawMaterials rawMaterial = proRawMaterialsRepository
                                                        .findByIdAndTenant(req.getRawMaterialId(), tenant)
                                                        .orElseThrow(() -> new EntityNotFoundException(
                                                                        "Raw Material not found: "
                                                                                        + req.getRawMaterialId()));

                                        ProProcess process = null;
                                        if (req.getProcessId() != null) {
                                                process = proProcessRepository
                                                                .findByIdAndTenant(req.getProcessId(), tenant)
                                                                .orElseThrow(() -> new EntityNotFoundException(
                                                                                "Process not found: " + req
                                                                                                .getProcessId()));
                                        }

                                        MaterialIndentDetail newDetail = MaterialIndentDetail.builder()
                                                        .materialIndent(materialIndent)
                                                        .rawMaterial(rawMaterial)
                                                        .process(process)
                                                        .indentQuantity(req.getIndentQuantity())
                                                        .remarks(req.getRemarks())
                                                        .additionalDescription(req.getAdditionalDescription())
                                                        .build();
                                        detailsToAdd.add(newDetail);
                                }
                        }

                        // 2. Identify Orphans (details present in DB but not in Request)
                        currentDetails.removeIf(existing -> existing.getId() != null
                                        && !matchedDetailIds.contains(existing.getId()));

                        // 3. Add new ones
                        currentDetails.addAll(detailsToAdd);
                }

                MaterialIndent savedIndent = materialIndentRepository.saveAndFlush(materialIndent);

                entityManager.detach(savedIndent);
                MaterialIndent refreshedIndent = materialIndentRepository.findByIdAndTenant(savedIndent.getId(), tenant)
                                .orElseThrow(() -> new EntityNotFoundException(
                                                "Material Indent not found after update"));

                return MaterialIndentResponse.fromEntity(refreshedIndent);
        }

        @Override
        public MaterialIndentResponse getById(Long id, HttpServletRequest httpRequest) {
                String tenantIdStr = TenantContext.getTenantId();
                Tenant tenant = tenantRepository.findByTenantId(tenantIdStr)
                                .orElseThrow(() -> new EntityNotFoundException("Tenant not found"));

                MaterialIndent materialIndent = materialIndentRepository.findByIdAndTenant(id, tenant)
                                .orElseThrow(() -> new EntityNotFoundException("Material Indent not found"));

                return MaterialIndentResponse.fromEntity(materialIndent);
        }

        @Override
        public Page<MaterialIndentResponse> getAll(Pageable pageable, HttpServletRequest httpRequest) {
                String tenantIdStr = TenantContext.getTenantId();
                Tenant tenant = tenantRepository.findByTenantId(tenantIdStr)
                                .orElseThrow(() -> new EntityNotFoundException("Tenant not found"));

                Page<MaterialIndent> indents = materialIndentRepository.findByTenant(tenant, pageable);
                return indents.map(MaterialIndentResponse::fromEntity);
        }

        @Override
        @Transactional
        public void delete(Long id, HttpServletRequest httpRequest) {
                String tenantIdStr = TenantContext.getTenantId();
                Tenant tenant = tenantRepository.findByTenantId(tenantIdStr)
                                .orElseThrow(() -> new EntityNotFoundException("Tenant not found"));

                MaterialIndent materialIndent = materialIndentRepository.findByIdAndTenant(id, tenant)
                                .orElseThrow(() -> new EntityNotFoundException("Material Indent not found"));

                materialIndentRepository.delete(materialIndent);
        }

        @Override
        @Transactional
        public MaterialIndentResponse updateStatus(Long id, MaterialIndentRequest request,
                        HttpServletRequest httpRequest) {
                String tenantIdStr = TenantContext.getTenantId();
                Tenant tenant = tenantRepository.findByTenantId(tenantIdStr)
                                .orElseThrow(() -> new EntityNotFoundException("Tenant not found"));

                MaterialIndent materialIndent = materialIndentRepository.findByIdAndTenant(id, tenant)
                                .orElseThrow(() -> new EntityNotFoundException("Material Indent not found"));

                if (request.getApprovalStatus() != null) {
                        materialIndent.setApprovalStatus(request.getApprovalStatus());
                }

                if (request.getCreatePoStatus() != null) {
                        materialIndent.setCreatePoStatus(request.getCreatePoStatus());
                }

                if (request.getApprovedDate() != null) {
                        materialIndent.setApprovedDate(request.getApprovedDate());
                }

                if (request.getApprovedById() != null) {
                        Employee approvedBy = employeeRepository.findById(request.getApprovedById())
                                        .orElseThrow(() -> new EntityNotFoundException(
                                                        "Approved By Employee not found"));
                        materialIndent.setApprovedBy(approvedBy);
                }

                MaterialIndent savedIndent = materialIndentRepository.saveAndFlush(materialIndent);

                entityManager.detach(savedIndent);
                MaterialIndent refreshedIndent = materialIndentRepository.findByIdAndTenant(savedIndent.getId(), tenant)
                                .orElseThrow(() -> new EntityNotFoundException(
                                                "Material Indent not found after update"));

                if (refreshedIndent.getMaterialRequisition() != null)
                        Hibernate.initialize(refreshedIndent.getMaterialRequisition());
                if (refreshedIndent.getLocation() != null)
                        Hibernate.initialize(refreshedIndent.getLocation());
                if (refreshedIndent.getEmployee() != null)
                        Hibernate.initialize(refreshedIndent.getEmployee());
                if (refreshedIndent.getDepartment() != null)
                        Hibernate.initialize(refreshedIndent.getDepartment());
                if (refreshedIndent.getApprovedBy() != null)
                        Hibernate.initialize(refreshedIndent.getApprovedBy());
                if (refreshedIndent.getDetails() != null)
                        Hibernate.initialize(refreshedIndent.getDetails());

                return MaterialIndentResponse.fromEntity(refreshedIndent);
        }

        @Override
        @Transactional
        public MaterialIndentResponse updateApproval(Long id,
                        com.example.multi_tanent.materials.dto.IndentApprovalRequest request,
                        HttpServletRequest httpRequest) {
                String tenantIdStr = TenantContext.getTenantId();
                Tenant tenant = tenantRepository.findByTenantId(tenantIdStr)
                                .orElseThrow(() -> new EntityNotFoundException("Tenant not found"));

                MaterialIndent materialIndent = materialIndentRepository.findByIdAndTenant(id, tenant)
                                .orElseThrow(() -> new EntityNotFoundException("Material Indent not found"));

                if (request.getApprovalStatus() != null) {
                        materialIndent.setApprovalStatus(request.getApprovalStatus());
                }

                if (request.getApprovedDate() != null) {
                        materialIndent.setApprovedDate(request.getApprovedDate());
                }

                if (request.getApprovedById() != null) {
                        Employee approvedBy = employeeRepository.findById(request.getApprovedById())
                                        .orElseThrow(() -> new EntityNotFoundException(
                                                        "Approved By Employee not found"));
                        materialIndent.setApprovedBy(approvedBy);
                }

                MaterialIndent savedIndent = materialIndentRepository.saveAndFlush(materialIndent);

                entityManager.detach(savedIndent);
                MaterialIndent refreshedIndent = materialIndentRepository.findByIdAndTenant(savedIndent.getId(), tenant)
                                .orElseThrow(() -> new EntityNotFoundException(
                                                "Material Indent not found after update"));

                // Initialize Lazy fields
                if (refreshedIndent.getMaterialRequisition() != null)
                        Hibernate.initialize(refreshedIndent.getMaterialRequisition());
                if (refreshedIndent.getLocation() != null)
                        Hibernate.initialize(refreshedIndent.getLocation());
                if (refreshedIndent.getEmployee() != null)
                        Hibernate.initialize(refreshedIndent.getEmployee());
                if (refreshedIndent.getDepartment() != null)
                        Hibernate.initialize(refreshedIndent.getDepartment());
                if (refreshedIndent.getApprovedBy() != null)
                        Hibernate.initialize(refreshedIndent.getApprovedBy());
                if (refreshedIndent.getDetails() != null)
                        Hibernate.initialize(refreshedIndent.getDetails());

                return MaterialIndentResponse.fromEntity(refreshedIndent);
        }

        @Override
        @Transactional
        public MaterialIndentResponse updatePoStatus(Long id,
                        com.example.multi_tanent.materials.dto.PoStatusRequest request,
                        HttpServletRequest httpRequest) {
                String tenantIdStr = TenantContext.getTenantId();
                Tenant tenant = tenantRepository.findByTenantId(tenantIdStr)
                                .orElseThrow(() -> new EntityNotFoundException("Tenant not found"));

                MaterialIndent materialIndent = materialIndentRepository.findByIdAndTenant(id, tenant)
                                .orElseThrow(() -> new EntityNotFoundException("Material Indent not found"));

                if (request.getCreatePoStatus() != null) {
                        materialIndent.setCreatePoStatus(request.getCreatePoStatus());
                }

                MaterialIndent savedIndent = materialIndentRepository.saveAndFlush(materialIndent);

                entityManager.detach(savedIndent);
                MaterialIndent refreshedIndent = materialIndentRepository.findByIdAndTenant(savedIndent.getId(), tenant)
                                .orElseThrow(() -> new EntityNotFoundException(
                                                "Material Indent not found after update"));

                // Initialize Lazy fields
                if (refreshedIndent.getMaterialRequisition() != null)
                        Hibernate.initialize(refreshedIndent.getMaterialRequisition());
                if (refreshedIndent.getLocation() != null)
                        Hibernate.initialize(refreshedIndent.getLocation());
                if (refreshedIndent.getEmployee() != null)
                        Hibernate.initialize(refreshedIndent.getEmployee());
                if (refreshedIndent.getDepartment() != null)
                        Hibernate.initialize(refreshedIndent.getDepartment());
                if (refreshedIndent.getApprovedBy() != null)
                        Hibernate.initialize(refreshedIndent.getApprovedBy());
                if (refreshedIndent.getDetails() != null)
                        Hibernate.initialize(refreshedIndent.getDetails());

                return MaterialIndentResponse.fromEntity(refreshedIndent);
        }
}
