package com.example.multi_tanent.hanger.service;

import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.hanger.dto.HngDowntimeLogRequest;
import com.example.multi_tanent.hanger.dto.HngDowntimeLogResponse;
import com.example.multi_tanent.hanger.entity.HngMachineDowntimeLog;
import com.example.multi_tanent.hanger.entity.HngProductionBatch;
import com.example.multi_tanent.hanger.repository.HngMachineDowntimeLogRepository;
import com.example.multi_tanent.hanger.repository.HngProductionBatchRepository;
import com.example.multi_tanent.production.entity.ProWorkStation;
import com.example.multi_tanent.production.repository.ProWorkStationRepository;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HngMachineDowntimeLogService {

    private final HngMachineDowntimeLogRepository downtimeRepo;
    private final ProWorkStationRepository workStationRepo;
    private final HngProductionBatchRepository batchRepo;
    private final TenantRepository tenantRepo;

    private Long getCurrentTenantId() {
        String slug = TenantContext.getTenantId();
        return tenantRepo.findByTenantId(slug)
                .map(Tenant::getId)
                .orElseThrow(() -> new RuntimeException("Tenant not resolved for slug: " + slug));
    }

    @Transactional
    public HngDowntimeLogResponse createLog(HngDowntimeLogRequest request) {
        Long tenantId = getCurrentTenantId();
        Tenant tenant = tenantRepo.findById(tenantId).orElseThrow();

        ProWorkStation workStation = workStationRepo.findById(request.getWorkstationId())
                .orElseThrow(() -> new RuntimeException("Workstation not found"));

        HngProductionBatch batch = null;
        if (request.getBatchId() != null) {
            batch = batchRepo.findByIdAndTenantId(request.getBatchId(), tenantId)
                    .orElseThrow(() -> new RuntimeException("Batch not found"));
        }

        Integer durationMinutes = null;
        if (request.getStartTime() != null && request.getEndTime() != null) {
            durationMinutes = (int) Duration.between(request.getStartTime(), request.getEndTime()).toMinutes();
        }

        HngMachineDowntimeLog log = HngMachineDowntimeLog.builder()
                .tenant(tenant)
                .workStation(workStation)
                .batch(batch)
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .durationMinutes(durationMinutes)
                .downtimeCategory(request.getDowntimeCategory())
                .notes(request.getNotes())
                .build();

        return mapToResponse(downtimeRepo.save(log));
    }

    public List<HngDowntimeLogResponse> getLogsByBatch(Long batchId) {
        Long tenantId = getCurrentTenantId();
        return downtimeRepo.findByBatch_IdAndTenantId(batchId, tenantId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<HngDowntimeLogResponse> getLogsByWorkStation(Long workstationId) {
        Long tenantId = getCurrentTenantId();
        return downtimeRepo.findByWorkStation_IdAndTenantId(workstationId, tenantId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private HngDowntimeLogResponse mapToResponse(HngMachineDowntimeLog log) {
        return HngDowntimeLogResponse.builder()
                .id(log.getId())
                .workstationId(log.getWorkStation().getId())
                .workstationName(log.getWorkStation().getWorkstationName())
                .machineId(log.getWorkStation().getMachineId())
                .batchId(log.getBatch() != null ? log.getBatch().getId() : null)
                .batchNo(log.getBatch() != null ? log.getBatch().getBatchNo() : null)
                .startTime(log.getStartTime())
                .endTime(log.getEndTime())
                .durationMinutes(log.getDurationMinutes())
                .downtimeCategory(log.getDowntimeCategory())
                .notes(log.getNotes())
                .createdAt(log.getCreatedAt())
                .build();
    }
}
