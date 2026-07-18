package com.example.multi_tanent.crm.services;

import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.crm.dto.CrmLeadStageRequest;
import com.example.multi_tanent.crm.dto.CrmLeadStageResponse;
import com.example.multi_tanent.crm.entity.CrmLeadStage;
import com.example.multi_tanent.crm.enums.CrmStageMoveTo;
import com.example.multi_tanent.crm.repository.CrmLeadStageRepository;
import com.example.multi_tanent.spersusers.enitity.Location;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.LocationRepository;
import com.example.multi_tanent.spersusers.repository.TenantRepository;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional("tenantTx")
public class CrmLeadStageService {

    private final CrmLeadStageRepository repo;
    private final TenantRepository tenantRepo;
    private final LocationRepository locationRepository;

    private Tenant currentTenant() {
        String tenantId = TenantContext.getTenantId();
        return tenantRepo.findFirstByOrderByIdAsc()
                .orElseThrow(() -> new IllegalStateException("Tenant not found for tenantId: " + tenantId));
    }

    @Transactional(readOnly = true)
    public List<CrmLeadStageResponse> getAll() {
        Tenant t = currentTenant();
        return repo.findByTenantIdOrderBySortOrderAscIdAsc(t.getId())
                .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public CrmLeadStageResponse getById(Long id) {
        Tenant t = currentTenant();
        CrmLeadStage e = repo.findByIdAndTenantId(id, t.getId())
                .orElseThrow(() -> new EntityNotFoundException("Lead stage not found: " + id));
        return toResponse(e);
    }

    public CrmLeadStageResponse create(CrmLeadStageRequest req) {
        Tenant t = currentTenant();
        String name = req.getName().trim();

        if (repo.existsByTenantIdAndNameIgnoreCase(t.getId(), name)) {
            throw new IllegalArgumentException("Lead stage already exists: " + name);
        }

        int nextOrder = repo.findFirstByTenantIdOrderBySortOrderDesc(t.getId())
                .map(s -> s.getSortOrder() + 1).orElse(1);

        Location location = null;
        if (req.getLocationId() != null) {
            location = locationRepository.findById(req.getLocationId())
                    .orElseThrow(
                            () -> new EntityNotFoundException("Location not found with id: " + req.getLocationId()));
        }

        CrmLeadStage e = CrmLeadStage.builder()
                .tenant(t)
                .location(location)
                .name(name)
                .name(name)
                .isDefault(Boolean.TRUE.equals(req.getIsDefault()))
                .isConverted(Boolean.TRUE.equals(req.getIsConverted()))
                .isWon(Boolean.TRUE.equals(req.getIsWon()))
                .isMql(Boolean.TRUE.equals(req.getIsMql()))
                .isSql(Boolean.TRUE.equals(req.getIsSql()))
                .probability(req.getProbability())
                .assignTo(Boolean.TRUE.equals(req.getAssignTo()))
                .sortOrder(req.getSortOrder() != null ? req.getSortOrder() : nextOrder)
                .moveTo(req.getMoveTo())
                .build();

        if (e.isDefault()) {
            repo.findFirstByTenantIdAndIsDefaultTrue(t.getId())
                    .ifPresent(prev -> {
                        prev.setDefault(false);
                        repo.save(prev);
                    });
        }

        // Handle uniqueness for other flags
        handleUniqueness(e, t.getId());

        return toResponse(repo.save(e));
    }

    public CrmLeadStageResponse update(Long id, CrmLeadStageRequest req) {
        Tenant t = currentTenant();
        CrmLeadStage e = repo.findByIdAndTenantId(id, t.getId())
                .orElseThrow(() -> new EntityNotFoundException("Lead stage not found: " + id));

        if (req.getName() != null) {
            String newName = req.getName().trim();
            if (!e.getName().equalsIgnoreCase(newName)
                    && repo.existsByTenantIdAndNameIgnoreCase(t.getId(), newName)) {
                throw new IllegalArgumentException("Stage name already exists: " + newName);
            }
            e.setName(newName);
        }

        if (req.getLocationId() != null) {
            Location location = locationRepository.findById(req.getLocationId())
                    .orElseThrow(
                            () -> new EntityNotFoundException("Location not found with id: " + req.getLocationId()));
            e.setLocation(location);
        } else {
            e.setLocation(null);
        }

        if (req.getMoveTo() != null) {
            e.setMoveTo(req.getMoveTo());
        }

        if (req.getSortOrder() != null)
            e.setSortOrder(req.getSortOrder());

        if (req.getIsDefault() != null && req.getIsDefault() != e.isDefault()) {
            if (Boolean.TRUE.equals(req.getIsDefault())) {
                repo.findFirstByTenantIdAndIsDefaultTrue(t.getId())
                        .ifPresent(prev -> {
                            prev.setDefault(false);
                            repo.save(prev);
                        });
                e.setDefault(true);
            } else {
                e.setDefault(false);
            }
        }

        if (req.getIsConverted() != null && req.getIsConverted() != e.isConverted())
            e.setConverted(req.getIsConverted());
        if (req.getIsWon() != null && req.getIsWon() != e.isWon())
            e.setWon(req.getIsWon());
        if (req.getIsMql() != null && req.getIsMql() != e.isMql())
            e.setMql(req.getIsMql());
        if (req.getIsSql() != null && req.getIsSql() != e.isSql())
            e.setSql(req.getIsSql());
        if (req.getProbability() != null)
            e.setProbability(req.getProbability());
        if (req.getAssignTo() != null && req.getAssignTo() != e.isAssignTo())
            e.setAssignTo(req.getAssignTo());

        handleUniqueness(e, t.getId());

        return toResponse(repo.save(e));
    }

    public void delete(Long id) {
        CrmLeadStage e = repo.findByIdAndTenantId(id, currentTenant().getId())
                .orElseThrow(() -> new EntityNotFoundException("Lead stage not found: " + id));
        repo.delete(e);
    }

    /** Move up (swap with previous by sortOrder). */
    public CrmLeadStageResponse moveUp(Long id) {
        Tenant t = currentTenant();
        CrmLeadStage e = repo.findByIdAndTenantId(id, t.getId())
                .orElseThrow(() -> new EntityNotFoundException("Lead stage not found: " + id));

        var prev = repo.findFirstByTenantIdAndSortOrderLessThanOrderBySortOrderDesc(t.getId(), e.getSortOrder())
                .orElse(null);
        if (prev == null)
            return toResponse(e);

        int tmp = e.getSortOrder();
        e.setSortOrder(prev.getSortOrder());
        prev.setSortOrder(tmp);
        repo.save(prev);
        return toResponse(repo.save(e));
    }

    /** Move down (swap with next by sortOrder). */
    public CrmLeadStageResponse moveDown(Long id) {
        Tenant t = currentTenant();
        CrmLeadStage e = repo.findByIdAndTenantId(id, t.getId())
                .orElseThrow(() -> new EntityNotFoundException("Lead stage not found: " + id));

        var next = repo.findFirstByTenantIdAndSortOrderGreaterThanOrderBySortOrderAsc(t.getId(), e.getSortOrder())
                .orElse(null);
        if (next == null)
            return toResponse(e);

        int tmp = e.getSortOrder();
        e.setSortOrder(next.getSortOrder());
        next.setSortOrder(tmp);
        repo.save(next);
        return toResponse(repo.save(e));
    }

    /** Mark one as default (unset previous). */
    public CrmLeadStageResponse setDefault(Long id) {
        Tenant t = currentTenant();
        CrmLeadStage e = repo.findByIdAndTenantId(id, t.getId())
                .orElseThrow(() -> new EntityNotFoundException("Lead stage not found: " + id));

        repo.findFirstByTenantIdAndIsDefaultTrue(t.getId())
                .ifPresent(prev -> {
                    if (!prev.getId().equals(e.getId())) {
                        prev.setDefault(false);
                        repo.save(prev);
                    }
                });
        e.setDefault(true);
        return toResponse(repo.save(e));
    }

    private void handleUniqueness(CrmLeadStage e, Long tenantId) {
        if (e.isConverted()) {
            repo.findByTenantIdAndIsConvertedTrue(tenantId).ifPresent(prev -> {
                if (!prev.getId().equals(e.getId())) {
                    prev.setConverted(false);
                    repo.save(prev);
                }
            });
        }
        if (e.isWon()) {
            repo.findByTenantIdAndIsWonTrue(tenantId).ifPresent(prev -> {
                if (!prev.getId().equals(e.getId())) {
                    prev.setWon(false);
                    repo.save(prev);
                }
            });
        }
        if (e.isMql()) {
            repo.findByTenantIdAndIsMqlTrue(tenantId).ifPresent(prev -> {
                if (!prev.getId().equals(e.getId())) {
                    prev.setMql(false);
                    repo.save(prev);
                }
            });
        }
        if (e.isSql()) {
            repo.findByTenantIdAndIsSqlTrue(tenantId).ifPresent(prev -> {
                if (!prev.getId().equals(e.getId())) {
                    prev.setSql(false);
                    repo.save(prev);
                }
            });
        }
    }

    private CrmLeadStageResponse toResponse(CrmLeadStage e) {
        CrmLeadStageResponse.CrmLeadStageResponseBuilder builder = CrmLeadStageResponse.builder()
                .id(e.getId())
                .name(e.getName())
                .isDefault(e.isDefault())
                .sortOrder(e.getSortOrder())
                .moveTo(e.getMoveTo())
                .isConverted(e.isConverted())
                .isWon(e.isWon())
                .isMql(e.isMql())
                .isSql(e.isSql())
                .probability(e.getProbability())
                .assignTo(e.isAssignTo())
                .tenantId(e.getTenant() != null ? e.getTenant().getId() : null);

        if (e.getLocation() != null) {
            builder.locationId(e.getLocation().getId());
            builder.locationName(e.getLocation().getName());
        }

        return builder.build();
    }
}