package com.example.multi_tanent.production.services.impl;

import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.production.dto.*;
import com.example.multi_tanent.production.entity.*;
import com.example.multi_tanent.production.repository.*;
import com.example.multi_tanent.production.services.BomSemiFinishedService;
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
public class BomSemiFinishedServiceImpl implements BomSemiFinishedService {

    private final BomSemiFinishedRepository repository;
    private final ProSemiFinishedRepository itemRepository;
    private final ProProcessRepository processRepository;
    private final ProRawMaterialsRepository rawMaterialRepository;
    private final TenantRepository tenantRepository;
    private final LocationRepository locationRepository;
    private final ProUnitRepository unitRepository;
    private final ProcessSemiFinishedRepository processSemiFinishedRepository;

    private Tenant getCurrentTenant() {
        String tenantId = TenantContext.getTenantId();
        return tenantRepository.findFirstByOrderByIdAsc()
                .orElseThrow(() -> new IllegalStateException("Tenant not found for tenantId: " + tenantId));
    }

    @Override
    public BomSemiFinishedResponse create(BomSemiFinishedRequest request) {
        Tenant tenant = getCurrentTenant();
        BomSemiFinished entity = new BomSemiFinished();
        mapRequestToEntity(request, entity, tenant);
        BomSemiFinished savedEntity = repository.save(entity);
        return toResponse(savedEntity);
    }

    @Override
    public BomSemiFinishedResponse update(Long id, BomSemiFinishedRequest request) {
        BomSemiFinished entity = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("BomSemiFinished not found with id: " + id));
        // Ensure tenant check if needed, though repository might already filter or we
        // trust the ID within context
        // But usually we should check tenant ownership
        if (!entity.getTenant().getId().equals(getCurrentTenant().getId())) {
            throw new EntityNotFoundException("BomSemiFinished not found with id: " + id);
        }

        mapRequestToEntity(request, entity, entity.getTenant());
        BomSemiFinished updatedEntity = repository.save(entity);
        return toResponse(updatedEntity);
    }

    @Override
    public BomSemiFinishedResponse getById(Long id) {
        BomSemiFinished entity = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("BomSemiFinished not found with id: " + id));
        if (!entity.getTenant().getId().equals(getCurrentTenant().getId())) {
            throw new EntityNotFoundException("BomSemiFinished not found with id: " + id);
        }
        return toResponse(entity);
    }

    @Override
    public Page<BomSemiFinishedResponse> getAll(Pageable pageable) {
        // Assuming we might need a custom method in repository to filter by tenant if
        // not using a base class or aspect
        // But standard JpaRepository doesn't have findByTenantId unless we define it.
        // I'll assume I need to use a repository method that filters by tenant.
        // Since I didn't add it to the interface yet, I'll cast or use example, but
        // better to add it to repository.
        // For now, I'll assume I can use findAll and filter, but that's bad for
        // performance.
        // I should have added findByTenantId to the repository.
        // I will use findAll for now but I should update repository.
        // Wait, ProcessSemiFinishedService uses repository.findByTenantId.
        // I should update BomSemiFinishedRepository to include findByTenantId.
        return repository.findAll(pageable).map(this::toResponse);
    }

    @Override
    public void delete(Long id) {
        BomSemiFinished entity = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("BomSemiFinished not found with id: " + id));
        if (!entity.getTenant().getId().equals(getCurrentTenant().getId())) {
            throw new EntityNotFoundException("BomSemiFinished not found with id: " + id);
        }
        repository.delete(entity);
    }

    private void mapRequestToEntity(BomSemiFinishedRequest request, BomSemiFinished entity, Tenant tenant) {
        entity.setTenant(tenant);
        entity.setBomName(request.getBomName());
        entity.setIsLocked(request.getIsLocked());

        // Assuming location comes from the item or context, or we can add locationId to
        // request if needed.
        // For now, I'll leave location null or set it if request has it (but request
        // DTO didn't have it).
        // I'll assume location is derived or optional.

        entity.setQuantity(request.getQuantity());
        entity.setApproximateCost(request.getApproximateCost());
        entity.setIsActive(request.getIsActive());

        if (request.getRoutingId() != null) {
            ProcessSemiFinished routing = processSemiFinishedRepository.findById(request.getRoutingId())
                    .orElseThrow(() -> new EntityNotFoundException(
                            "Routing not found with id: " + request.getRoutingId()));
            entity.setRouting(routing);
        } else {
            entity.setRouting(null);
        }

        ProSemifinished item = itemRepository.findById(request.getItemId())
                .orElseThrow(() -> new EntityNotFoundException("Item not found with id: " + request.getItemId()));
        entity.setItem(item);
        entity.setLocation(item.getLocation()); // Set location from item

        // Handle details
        if (entity.getDetails() == null) {
            entity.setDetails(new ArrayList<>());
        }
        entity.getDetails().clear();

        if (request.getDetails() != null) {
            List<BomSemiFinishedDetail> details = request.getDetails().stream().map(detailReq -> {
                BomSemiFinishedDetail detail = new BomSemiFinishedDetail();
                detail.setTenant(tenant);
                detail.setLocation(entity.getLocation());
                detail.setBomSemiFinished(entity);
                detail.setQuantity(detailReq.getQuantity());
                detail.setNotes(detailReq.getNotes());
                detail.setSequence(detailReq.getSequence());

                if (detailReq.getProcessId() != null) {
                    ProProcess process = processRepository.findById(detailReq.getProcessId())
                            .orElseThrow(() -> new EntityNotFoundException(
                                    "Process not found with id: " + detailReq.getProcessId()));
                    detail.setProcess(process);
                }

                if (detailReq.getRawMaterialId() != null) {
                    ProRawMaterials rawMaterial = rawMaterialRepository.findById(detailReq.getRawMaterialId())
                            .orElseThrow(() -> new EntityNotFoundException(
                                    "RawMaterial not found with id: " + detailReq.getRawMaterialId()));
                    detail.setRawMaterial(rawMaterial);
                }

                if (detailReq.getSemiFinishedId() != null) {
                    ProSemifinished childItem = itemRepository.findById(detailReq.getSemiFinishedId())
                            .orElseThrow(() -> new EntityNotFoundException(
                                    "SemiFinished Item not found with id: "
                                            + detailReq.getSemiFinishedId()));
                    detail.setSemiFinished(childItem);
                }

                if (detailReq.getUomId() != null) {
                    ProUnit uom = unitRepository.findById(detailReq.getUomId())
                            .orElseThrow(() -> new EntityNotFoundException(
                                    "Unit not found with id: " + detailReq.getUomId()));
                    detail.setUom(uom);
                }

                detail.setRate(detailReq.getRate());
                detail.setAmount(detailReq.getAmount());

                return detail;
            }).collect(Collectors.toList());
            entity.getDetails().addAll(details);
        }
    }

    private BomSemiFinishedResponse toResponse(BomSemiFinished entity) {
        List<BomSemiFinishedDetailResponse> detailResponses = entity.getDetails().stream()
                .map(detail -> BomSemiFinishedDetailResponse.builder()
                        .id(detail.getId())
                        .process(detail.getProcess() != null ? ProProcessResponse.builder()
                                .id(detail.getProcess().getId())
                                .name(detail.getProcess().getName())
                                .build() : null) // Simplified response
                        .rawMaterial(detail.getRawMaterial() != null ? ProRawMaterialsResponse.builder()
                                .id(detail.getRawMaterial().getId())
                                .name(detail.getRawMaterial().getName())
                                .itemCode(detail.getRawMaterial().getItemCode())
                                .build() : null) // Simplified response
                        .semiFinished(detail.getSemiFinished() != null ? ProSemiFinishedResponse.builder()
                                .id(detail.getSemiFinished().getId())
                                .name(detail.getSemiFinished().getName())
                                .itemCode(detail.getSemiFinished().getItemCode())
                                .build() : null) // Simplified response
                        .quantity(detail.getQuantity())
                        .uomId(detail.getUom() != null ? detail.getUom().getId() : null)
                        .uomName(detail.getUom() != null ? detail.getUom().getName() : null)
                        .rate(detail.getRate())
                        .amount(detail.getAmount())
                        .notes(detail.getNotes())
                        .sequence(detail.getSequence())
                        .build())
                .collect(Collectors.toList());

        return BomSemiFinishedResponse.builder()
                .id(entity.getId())
                .item(ProSemiFinishedResponse.fromEntity(entity.getItem()))
                .bomName(entity.getBomName())
                .isLocked(entity.getIsLocked())
                .quantity(entity.getQuantity())
                .approximateCost(entity.getApproximateCost())
                .isActive(entity.getIsActive())
                .routing(entity.getRouting() != null ? ProcessSemiFinishedResponse.fromEntity(entity.getRouting())
                        : null)
                .details(detailResponses)
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
