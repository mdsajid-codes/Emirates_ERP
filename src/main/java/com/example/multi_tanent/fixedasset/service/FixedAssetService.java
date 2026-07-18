package com.example.multi_tanent.fixedasset.service;

import com.example.multi_tanent.accounts.entity.enums.AssetStatus;
import com.example.multi_tanent.accounts.exception.ResourceNotFoundException;
import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.fixedasset.dto.FixedAssetRequest;
import com.example.multi_tanent.fixedasset.dto.FixedAssetResponse;
import com.example.multi_tanent.fixedasset.entity.FixedAsset;
import com.example.multi_tanent.fixedasset.entity.FixedAssetCategory;
import com.example.multi_tanent.fixedasset.entity.FixedAssetClass;
import com.example.multi_tanent.fixedasset.entity.FixedAssetGroup;
import com.example.multi_tanent.fixedasset.repository.FixedAssetCategoryRepository;
import com.example.multi_tanent.fixedasset.repository.FixedAssetClassRepository;
import com.example.multi_tanent.fixedasset.repository.FixedAssetGroupRepository;
import com.example.multi_tanent.fixedasset.repository.FixedAssetRepository;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional("tenantTx")
public class FixedAssetService {

    private final FixedAssetRepository fixedAssetRepository;
    private final FixedAssetCategoryRepository categoryRepository;
    private final FixedAssetClassRepository classRepository;
    private final FixedAssetGroupRepository groupRepository;
    private final TenantRepository tenantRepository;

    private Tenant getCurrentTenant() {
        String tid = TenantContext.getTenantId();
        return tenantRepository.findByTenantId(tid)
                .or(() -> tenantRepository.findFirstByOrderByIdAsc())
                .orElseThrow(() -> new ResourceNotFoundException("No tenant record found in database."));
    }

    public List<FixedAssetResponse> getAllAssets() {
        Long tenantId = getCurrentTenant().getId();
        return fixedAssetRepository.findByTenant_Id(tenantId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public FixedAssetResponse getAssetById(Long id) {
        FixedAsset asset = fixedAssetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Asset not found with id: " + id));
        return mapToResponse(asset);
    }

    public FixedAssetResponse createAsset(FixedAssetRequest request) {
        FixedAssetCategory category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Category not found with id: " + request.getCategoryId()));
        }

        Tenant tenant = getCurrentTenant();

        FixedAssetClass assetClass = null;
        if (request.getClassId() != null) {
            assetClass = classRepository.findById(request.getClassId())
                    .orElseThrow(
                            () -> new ResourceNotFoundException("Class not found with id: " + request.getClassId()));
        }

        FixedAssetGroup group = null;
        if (request.getGroupId() != null) {
            group = groupRepository.findById(request.getGroupId())
                    .orElseThrow(
                            () -> new ResourceNotFoundException("Group not found with id: " + request.getGroupId()));
        }

        // Check if asset number already exists for this tenant
        fixedAssetRepository.findByAssetNumberAndTenant_Id(request.getAssetNumber(), tenant.getId())
                .ifPresent(a -> {
                    throw new RuntimeException("Asset number already exists: " + request.getAssetNumber());
                });

        FixedAsset asset = FixedAsset.builder()
                .assetNumber(request.getAssetNumber())
                .description(request.getDescription())
                .serialNumber(request.getSerialNumber())
                .category(category)
                .fixedAssetClass(assetClass)
                .fixedAssetGroup(group)
                .assetType(request.getAssetType())
                .hiredCompany(request.getHiredCompany())
                .hiredResource(request.getHiredResource() != null ? request.getHiredResource() : false)
                .useScheduling(request.getUseScheduling() != null ? request.getUseScheduling() : false)
                .location(request.getLocation())
                .purchaseDate(request.getPurchaseDate())
                .purchasePrice(request.getPurchasePrice())
                .salvageValue(request.getSalvageValue())
                .usefulLifeYears(request.getUsefulLifeYears())
                .depreciationMethod(request.getDepreciationMethod())
                .assetStatus(request.getAssetStatus() != null ? request.getAssetStatus() : AssetStatus.NEW)
                .tenant(tenant)
                .build();

        FixedAsset saved = fixedAssetRepository.save(asset);
        return mapToResponse(saved);
    }

    public FixedAssetResponse updateAsset(Long id, FixedAssetRequest request) {
        FixedAsset asset = fixedAssetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Asset not found with id: " + id));

        FixedAssetCategory category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Category not found with id: " + request.getCategoryId()));
        }

        FixedAssetClass assetClass = null;
        if (request.getClassId() != null) {
            assetClass = classRepository.findById(request.getClassId())
                    .orElseThrow(
                            () -> new ResourceNotFoundException("Class not found with id: " + request.getClassId()));
        }

        FixedAssetGroup group = null;
        if (request.getGroupId() != null) {
            group = groupRepository.findById(request.getGroupId())
                    .orElseThrow(
                            () -> new ResourceNotFoundException("Group not found with id: " + request.getGroupId()));
        }

        asset.setAssetNumber(request.getAssetNumber());
        asset.setDescription(request.getDescription());
        asset.setSerialNumber(request.getSerialNumber());
        asset.setCategory(category);
        asset.setFixedAssetClass(assetClass);
        asset.setFixedAssetGroup(group);
        asset.setAssetType(request.getAssetType());
        asset.setHiredCompany(request.getHiredCompany());
        asset.setHiredResource(request.getHiredResource());
        asset.setUseScheduling(request.getUseScheduling());
        asset.setLocation(request.getLocation());
        asset.setPurchaseDate(request.getPurchaseDate());
        asset.setPurchasePrice(request.getPurchasePrice());
        asset.setSalvageValue(request.getSalvageValue());
        asset.setUsefulLifeYears(request.getUsefulLifeYears());
        asset.setDepreciationMethod(request.getDepreciationMethod());
        asset.setAssetStatus(request.getAssetStatus());

        FixedAsset updated = fixedAssetRepository.save(asset);
        return mapToResponse(updated);
    }

    public void deleteAsset(Long id) {
        if (!fixedAssetRepository.existsById(id)) {
            throw new ResourceNotFoundException("Asset not found with id: " + id);
        }
        fixedAssetRepository.deleteById(id);
    }

    private FixedAssetResponse mapToResponse(FixedAsset asset) {
        return FixedAssetResponse.builder()
                .fixedAssetId(asset.getFixedAssetId())
                .assetNumber(asset.getAssetNumber())
                .description(asset.getDescription())
                .serialNumber(asset.getSerialNumber())
                .categoryId(asset.getCategory() != null ? asset.getCategory().getCategoryId() : null)
                .categoryName(asset.getCategory() != null ? asset.getCategory().getName() : null)
                .location(asset.getLocation())
                .purchaseDate(asset.getPurchaseDate())
                .purchasePrice(asset.getPurchasePrice())
                .salvageValue(asset.getSalvageValue())
                .usefulLifeYears(asset.getUsefulLifeYears())
                .depreciationMethod(asset.getDepreciationMethod())
                .assetStatus(asset.getAssetStatus())
                .assetType(asset.getAssetType())
                .hiredCompany(asset.getHiredCompany())
                .classId(asset.getFixedAssetClass() != null ? asset.getFixedAssetClass().getClassId() : null)
                .className(asset.getFixedAssetClass() != null ? asset.getFixedAssetClass().getName() : null)
                .groupId(asset.getFixedAssetGroup() != null ? asset.getFixedAssetGroup().getGroupId() : null)
                .groupName(asset.getFixedAssetGroup() != null ? asset.getFixedAssetGroup().getName() : null)
                .hiredResource(asset.getHiredResource())
                .useScheduling(asset.getUseScheduling())
                .createdAt(asset.getCreatedAt())
                .updatedAt(asset.getUpdatedAt())
                .build();
    }
}
