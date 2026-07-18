package com.example.multi_tanent.pos.service;

import com.example.multi_tanent.pos.dto.StockMovementDto;
import com.example.multi_tanent.pos.dto.StockMovementRequest;
import com.example.multi_tanent.pos.entity.*;
import com.example.multi_tanent.pos.repository.InventoryRepository;
import com.example.multi_tanent.pos.repository.ProductVariantRepository;
import com.example.multi_tanent.pos.repository.StockMovementRepository;
import com.example.multi_tanent.spersusers.enitity.Store;
import com.example.multi_tanent.spersusers.enitity.Tenant;
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
    private final ProductVariantRepository productVariantRepository;
    private final InventoryRepository inventoryRepository;

    public StockMovementService(StockMovementRepository stockMovementRepository,
                                TenantRepository tenantRepository,
                                StoreRepository storeRepository,
                                ProductVariantRepository productVariantRepository,
                                InventoryRepository inventoryRepository) {
        this.stockMovementRepository = stockMovementRepository;
        this.tenantRepository = tenantRepository;
        this.storeRepository = storeRepository;
        this.productVariantRepository = productVariantRepository;
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

        ProductVariant variant = productVariantRepository.findById(request.getProductVariantId())
                .orElseThrow(() -> new RuntimeException("ProductVariant not found with id: " + request.getProductVariantId()));

        if (!variant.getProduct().getTenant().getId().equals(currentTenant.getId())) {
            throw new SecurityException("Attempted to move stock for a product from another tenant.");
        }

        StockMovement movement = StockMovement.builder()
                .tenant(currentTenant)
                .store(store)
                .productVariant(variant)
                .changeQuantity(request.getChangeQuantity())
                .reason(request.getReason())
                .batchCode(request.getBatchCode())
                .expireDate(request.getExpireDate())
                .build();

        StockMovement savedMovement = stockMovementRepository.save(movement);

        // Now, update the master Inventory record
        updateInventoryFromMovement(store, variant, request.getChangeQuantity());

        return toDto(savedMovement);
    }

    /**
     * Creates a stock movement record specifically for a sale transaction.
     * This is intended to be called by the SaleService after a sale is created.
     *
     * @param sale The Sale entity that triggered this stock movement.
     * @param variant The product variant being sold.
     * @param changeQuantity The quantity change (should be negative for a sale).
     */
    public void createMovementForSale(Sale sale, ProductVariant variant, Long changeQuantity) {
        if (changeQuantity >= 0) {
            throw new IllegalArgumentException("Quantity change for a sale must be negative.");
        }

        StockMovement movement = StockMovement.builder()
                .tenant(sale.getTenant())
                .store(sale.getStore())
                .productVariant(variant)
                .changeQuantity(changeQuantity)
                .reason("Sale")
                .relatedSale(sale)
                .build();

        stockMovementRepository.save(movement);

        // Now, update the master Inventory record
        updateInventoryFromMovement(sale.getStore(), variant, changeQuantity);
    }

    /**
     * A generic method to save a stock movement and apply its changes to the inventory.
     * This is useful for reversals or adjustments.
     *
     * @param movement The StockMovement entity to be saved.
     * @return The saved StockMovement entity.
     */
    public StockMovement createAndApplyStockMovement(StockMovement movement) {
        StockMovement savedMovement = stockMovementRepository.save(movement);
        updateInventoryFromMovement(movement.getStore(), movement.getProductVariant(), movement.getChangeQuantity());
        return savedMovement;
    }

    private void updateInventoryFromMovement(Store store, ProductVariant variant, Long changeQuantity) {
        Inventory inventory = inventoryRepository.findByStoreIdAndProductVariantId(store.getId(), variant.getId())
                .orElse(new Inventory(null, store, variant, 0L));

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
        if (movement.getProductVariant() != null) {
            dto.setProductVariantId(movement.getProductVariant().getId());
            dto.setProductVariantSku(movement.getProductVariant().getSku());
            if (movement.getProductVariant().getProduct() != null) {
                dto.setProductName(movement.getProductVariant().getProduct().getName());
            }
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