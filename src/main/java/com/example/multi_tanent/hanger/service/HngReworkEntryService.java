package com.example.multi_tanent.hanger.service;

import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.hanger.dto.HngReworkEntryRequest;
import com.example.multi_tanent.hanger.dto.HngReworkEntryResponse;
import com.example.multi_tanent.hanger.entity.HngProductionBatch;
import com.example.multi_tanent.hanger.entity.HngReworkEntry;
import com.example.multi_tanent.hanger.enums.BatchStage;
import com.example.multi_tanent.hanger.enums.ReworkStatus;
import com.example.multi_tanent.hanger.repository.HngProductionBatchRepository;
import com.example.multi_tanent.hanger.repository.HngReworkEntryRepository;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import com.example.multi_tanent.tenant.employee.repository.EmployeeRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HngReworkEntryService {

    private final HngReworkEntryRepository reworkRepo;
    private final HngProductionBatchRepository batchRepo;
    private final TenantRepository tenantRepo;
    private final EmployeeRepository employeeRepo;
    private final HngReworkEntryNumberGenerator numberGenerator;

    private Long getCurrentTenantId() {
        String slug = TenantContext.getTenantId();
        return tenantRepo.findByTenantId(slug)
                .map(Tenant::getId)
                .orElseThrow(() -> new EntityNotFoundException("Tenant not resolved for slug: " + slug));
    }

    @Transactional
    public HngReworkEntryResponse createReworkEntry(HngReworkEntryRequest request) {
        Long tenantId = getCurrentTenantId();
        Tenant tenant = tenantRepo.findById(tenantId)
                .orElseThrow(() -> new EntityNotFoundException("Tenant not found"));

        HngProductionBatch batch = batchRepo.findByIdAndTenantId(request.getBatchId(), tenantId)
                .orElseThrow(() -> new EntityNotFoundException("Batch not found"));

        HngReworkEntry rework = HngReworkEntry.builder()
                .tenant(tenant)
                .batch(batch)
                .reworkNo(numberGenerator.generate(tenantId))
                .sourceStage(request.getSourceStage())
                .targetStage(request.getTargetStage())
                .reworkQty(request.getReworkQty())
                .reason(request.getReason())
                .remarks(request.getRemarks())
                .status(ReworkStatus.PENDING)
                .build();

        if (request.getAssignedToId() != null) {
            rework.setAssignedTo(employeeRepo.findById(request.getAssignedToId()).orElse(null));
        }

        HngReworkEntry saved = reworkRepo.save(rework);

        // Advance batch backward if necessary to allow re-processing
        if (request.getTargetStage().ordinal() < batch.getCurrentStage().ordinal()) {
            batch.setCurrentStage(request.getTargetStage());
            batchRepo.save(batch);
        }

        return mapToResponse(saved);
    }

    public List<HngReworkEntryResponse> getByBatch(Long batchId) {
        Long tenantId = getCurrentTenantId();
        return reworkRepo.findByBatchIdAndTenantId(batchId, tenantId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private HngReworkEntryResponse mapToResponse(HngReworkEntry rework) {
        return HngReworkEntryResponse.builder()
                .id(rework.getId())
                .batchId(rework.getBatch().getId())
                .batchNo(rework.getBatch().getBatchNo())
                .reworkNo(rework.getReworkNo())
                .sourceStage(rework.getSourceStage())
                .targetStage(rework.getTargetStage())
                .reworkQty(rework.getReworkQty())
                .reason(rework.getReason())
                .remarks(rework.getRemarks())
                .status(rework.getStatus() != null ? rework.getStatus().name() : null)
                .assignedToName(rework.getAssignedTo() != null ? rework.getAssignedTo().getFirstName() : null)
                .createdAt(rework.getCreatedAt())
                .build();
    }
}
