package com.example.multi_tanent.production.services;

import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.production.dto.ProProcessRequest;
import com.example.multi_tanent.production.dto.ProProcessResponse;
import com.example.multi_tanent.production.entity.ProProcess;
import com.example.multi_tanent.production.entity.ProProcessWorkGroup;
import com.example.multi_tanent.production.entity.ProWorkGroup;
import com.example.multi_tanent.production.repository.ProProcessRepository;
import com.example.multi_tanent.production.repository.ProWorkGroupRepository;
import com.example.multi_tanent.spersusers.enitity.Location;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.LocationRepository;
import com.example.multi_tanent.spersusers.repository.TenantRepository;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional("tenantTx")
public class ProProcessService {

    private final ProProcessRepository processRepository;
    private final TenantRepository tenantRepository;
    private final LocationRepository locationRepository;
    private final ProWorkGroupRepository workGroupRepository;

    private Tenant getCurrentTenant() {
        String tenantId = TenantContext.getTenantId();
        return tenantRepository.findFirstByOrderByIdAsc()
                .orElseThrow(() -> new IllegalStateException("Tenant not found for tenantId: " + tenantId));
    }

    public ProProcessResponse createProcess(ProProcessRequest request) {
        Tenant tenant = getCurrentTenant();
        ProProcess process = new ProProcess();
        mapRequestToEntity(request, process, tenant);
        ProProcess savedProcess = processRepository.save(process);
        return toResponse(savedProcess);
    }

    public Page<ProProcessResponse> getAllProcesses(Pageable pageable) {
        return processRepository.findByTenantId(getCurrentTenant().getId(), pageable)
                .map(this::toResponse);
    }

    public ProProcessResponse getProcessById(Long id) {
        return processRepository.findByIdAndTenantId(id, getCurrentTenant().getId())
                .map(this::toResponse)
                .orElseThrow(() -> new EntityNotFoundException("Process not found with id: " + id));
    }

    public ProProcessResponse updateProcess(Long id, ProProcessRequest request) {
        ProProcess process = processRepository.findByIdAndTenantId(id, getCurrentTenant().getId())
                .orElseThrow(() -> new EntityNotFoundException("Process not found with id: " + id));
        mapRequestToEntity(request, process, process.getTenant());
        ProProcess updatedProcess = processRepository.save(process);
        return toResponse(updatedProcess);
    }

    public void deleteProcess(Long id) {
        if (!processRepository.existsById(id)) {
            throw new EntityNotFoundException("Process not found with id: " + id);
        }
        processRepository.deleteById(id);
    }

    private void mapRequestToEntity(ProProcessRequest request, ProProcess process, Tenant tenant) {
        process.setTenant(tenant);
        process.setName(request.getName());

        if (request.getLocationId() != null) {
            Location location = locationRepository.findById(request.getLocationId())
                    .orElseThrow(() -> new EntityNotFoundException("Location not found with id: " + request.getLocationId()));
            process.setLocation(location);
        } else {
            process.setLocation(null);
        }

        process.getWorkGroups().clear();
        if (request.getWorkGroups() != null) {
            List<ProProcessWorkGroup> processWorkGroups = request.getWorkGroups().stream().map(wgReq -> {
                ProWorkGroup workGroup = workGroupRepository.findById(wgReq.getWorkGroupId())
                        .orElseThrow(() -> new EntityNotFoundException("WorkGroup not found with id: " + wgReq.getWorkGroupId()));
                return ProProcessWorkGroup.builder()
                        .process(process)
                        .workGroup(workGroup)
                        .sequenceIndex(wgReq.getSequenceIndex())
                        .build();
            }).collect(Collectors.toList());
            process.getWorkGroups().addAll(processWorkGroups);
        }
    }

    private ProProcessResponse toResponse(ProProcess process) {
        ProProcessResponse.ProProcessResponseBuilder builder = ProProcessResponse.builder()
                .id(process.getId())
                .name(process.getName());

        if (process.getLocation() != null) {
            builder.locationId(process.getLocation().getId()).locationName(process.getLocation().getName());
        }

        List<ProProcessResponse.ProProcessWorkGroupResponse> wgResponses = process.getWorkGroups().stream().map(pwg ->
                ProProcessResponse.ProProcessWorkGroupResponse.builder()
                        .workGroupId(pwg.getWorkGroup().getId())
                        .workGroupName(pwg.getWorkGroup().getName())
                        .workGroupNumber(pwg.getWorkGroup().getNumber())
                        .sequenceIndex(pwg.getSequenceIndex())
                        .build()
        ).collect(Collectors.toList());
        builder.workGroups(wgResponses);

        return builder.build();
    }
}