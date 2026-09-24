package com.example.multi_tanent.pos.service;

import com.example.multi_tanent.pos.dto.StockMovementDto;
import com.example.multi_tanent.pos.dto.StockMovementRequest;
import com.example.multi_tanent.pos.entity.*;
import com.example.multi_tanent.pos.repository.InventoryRepository;
import com.example.multi_tanent.pos.repository.StockMovementRepository;
import com.example.multi_tanent.spersusers.enitity.CrmSalesProduct;
import com.example.multi_tanent.spersusers.enitity.Store;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.CrmSalesProductRepository;
import com.example.multi_tanent.spersusers.repository.StoreRepository;
import com.example.multi_tanent.spersusers.repository.TenantRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional("tenantTx")
public class StockMovementService {

    private final StockMovementRepository stockMovementRepository;
    private final TenantRepository tenantRepository;
    private final StoreRepository storeRepository;
    private final CrmSalesProductRepository crmSalesProductRepository;
    private final InventoryRepository inventoryRepository;

    public StockMovementService(StockMovementRepository stockMovementRepository,
                                TenantRepository tenantRepository,
                                StoreRepository storeRepository,
                                CrmSalesProductRepository crmSalesProductRepository,
                                InventoryRepository inventoryRepository) {
        this.stockMovementRepository = stockMovementRepository;
        this.tenantRepository = tenantRepository;
        this.storeRepository = storeRepository;
        this.crmSalesProductRepository = crmSalesProductRepository;
        this.inventoryRepository = inventoryRepository;
    }

    private Tenant getCurrentTenant() {
        return tenantRepository.findFirstByOrderByIdAsc()
                .orElseThrow(() -> new IllegalStateException("Tenant context not found."));
    }

    public StockMovementDto createStockMovement(StockMovementRequest request) {
        Tenant currentTenant = getCurrentTenant();

        Store store = storeRepository.findByIdAndTenantId(request.getStoreId(), currentTenant.getId())
                .orElseThrow(() -> new RuntimeException("Store not found with id: " + request.getStoreId()));

        CrmSalesProduct product = crmSalesProductRepository.findByIdAndTenantId(request.getProductId(), currentTenant.getId())
                .orElseThrow(() -> new RuntimeException("Master product not found with id: " + request.getProductId()));

        StockMovement movement = StockMovement.builder()
                .tenant(currentTenant)
                .store(store)
                .product(product)
                .changeQuantity(request.getChangeQuantity())
                .reason(request.getReason())
                .batchCode(request.getBatchCode())
                .expireDate(request.getExpireDate())
                .build();

        StockMovement savedMovement = stockMovementRepository.save(movement);

        updateInventoryFromMovement(store, product, request.getChangeQuantity());

        return toDto(savedMovement);
    }

    public void createMovementForSale(Sale sale, CrmSalesProduct product, Long changeQuantity) {
        if (changeQuantity >= 0) {
            throw new IllegalArgumentException("Quantity change for a sale must be negative.");
        }

        StockMovement movement = StockMovement.builder()
                .tenant(sale.getTenant())
                .store(sale.getStore())
                .product(product)
                .changeQuantity(changeQuantity)
                .reason("Sale")
                .relatedSale(sale)
                .build();

        stockMovementRepository.save(movement);

        updateInventoryFromMovement(sale.getStore(), product, changeQuantity);
    }

    public StockMovement createAndApplyStockMovement(StockMovement movement) {
        StockMovement savedMovement = stockMovementRepository.save(movement);
        updateInventoryFromMovement(movement.getStore(), movement.getProduct(), movement.getChangeQuantity());
        return savedMovement;
    }

    private void updateInventoryFromMovement(Store store, CrmSalesProduct product, Long changeQuantity) {
        Inventory inventory = inventoryRepository.findByStoreIdAndProductId(store.getId(), product.getId())
                .orElse(new Inventory(null, store, product, 0L));

        inventory.setQuantity(inventory.getQuantity() + changeQuantity);
        inventoryRepository.save(inventory);
    }

    @Transactional(readOnly = true)
    public List<StockMovementDto> getAllStockMovementsForCurrentTenant() {
        Tenant currentTenant = getCurrentTenant();
        return stockMovementRepository.findByTenantId(currentTenant.getId()).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Optional<StockMovementDto> getStockMovementDtoById(Long id) {
        Tenant currentTenant = getCurrentTenant();
        return stockMovementRepository.findByIdAndTenantId(id, currentTenant.getId()).map(this::toDto);
    }

    private StockMovementDto toDto(StockMovement movement) {
        StockMovementDto dto = new StockMovementDto();
        dto.setId(movement.getId());
        if (movement.getStore() != null) {
            dto.setStoreId(movement.getStore().getId());
            dto.setStoreName(movement.getStore().getName());
        }
        if (movement.getProduct() != null) {
            dto.setProductId(movement.getProduct().getId());
            dto.setProductName(movement.getProduct().getName());
        }
        dto.setChangeQuantity(movement.getChangeQuantity());
        dto.setReason(movement.getReason());
        if (movement.getRelatedSale() != null) {
            dto.setRelatedSaleId(movement.getRelatedSale().getId());
        }
        if (movement.getRelatedPurchase() != null) {
            dto.setRelatedPurchasePoNumber(movement.getRelatedPurchase().getPoNumber());
        }
        dto.setCreatedAt(movement.getCreatedAt());
        return dto;
    }
}