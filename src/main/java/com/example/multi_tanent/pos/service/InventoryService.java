package com.example.multi_tanent.pos.service;

import com.example.multi_tanent.pos.dto.InventoryDto;
import com.example.multi_tanent.pos.entity.Inventory;
import com.example.multi_tanent.pos.repository.InventoryRepository;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.TenantRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional("tenantTx")
public class InventoryService {

    private final InventoryRepository inventoryRepository;
    private final TenantRepository tenantRepository;

    public InventoryService(InventoryRepository inventoryRepository, TenantRepository tenantRepository) {
        this.inventoryRepository = inventoryRepository;
        this.tenantRepository = tenantRepository;
    }

    private Tenant getCurrentTenant() {
        return tenantRepository.findFirstByOrderByIdAsc()
                .orElseThrow(() -> new IllegalStateException("Tenant context not found."));
    }

    @Transactional(readOnly = true)
    public List<InventoryDto> getInventoryByStore(Long storeId) {
        // We can add a check here to ensure the store belongs to the current tenant
        return inventoryRepository.findByStoreId(storeId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    private InventoryDto toDto(Inventory inventory) {
        InventoryDto dto = new InventoryDto();
        dto.setInventoryId(inventory.getId())   ;
        dto.setStoreId(inventory.getStore().getId());
        dto.setStoreName(inventory.getStore().getName());
        dto.setProductVariantId(inventory.getProductVariant().getId());
        dto.setProductName(inventory.getProductVariant().getProduct().getName());
        dto.setProductVariantSku(inventory.getProductVariant().getSku());
        dto.setQuantity(inventory.getQuantity());
        return dto;
    }
}