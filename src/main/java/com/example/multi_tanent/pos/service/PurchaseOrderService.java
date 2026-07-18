package com.example.multi_tanent.pos.service;

import com.example.multi_tanent.pos.dto.PurchaseOrderDto;
import com.example.multi_tanent.pos.dto.PurchaseOrderItemDto;
import com.example.multi_tanent.pos.dto.PurchaseOrderRequest;
import com.example.multi_tanent.pos.entity.*;
import com.example.multi_tanent.pos.repository.*;
import com.example.multi_tanent.spersusers.enitity.Store;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.StoreRepository;
import com.example.multi_tanent.spersusers.repository.TenantRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional("tenantTx")
public class PurchaseOrderService {

    private final PurchaseOrderRepository purchaseOrderRepository;
    private final TenantRepository tenantRepository;
    private final StoreRepository storeRepository;
    private final ProductVariantRepository productVariantRepository;

    public PurchaseOrderService(PurchaseOrderRepository purchaseOrderRepository, TenantRepository tenantRepository, StoreRepository storeRepository, ProductVariantRepository productVariantRepository) {
        this.purchaseOrderRepository = purchaseOrderRepository;
        this.tenantRepository = tenantRepository;
        this.storeRepository = storeRepository;
        this.productVariantRepository = productVariantRepository;
    }

    private Tenant getCurrentTenant() {
        return tenantRepository.findFirstByOrderByIdAsc()
                .orElseThrow(() -> new IllegalStateException("Tenant context not found."));
    }

    public PurchaseOrderDto createPurchaseOrder(PurchaseOrderRequest request) {
        Tenant currentTenant = getCurrentTenant();

        Store store = storeRepository.findByIdAndTenantId(request.getStoreId(), currentTenant.getId())
                .orElseThrow(() -> new RuntimeException("Store not found with id: " + request.getStoreId()));

        PurchaseOrder po = new PurchaseOrder();
        po.setTenant(currentTenant);
        po.setStore(store);
        po.setSupplierName(request.getSupplierName());
        po.setPoNumber(generatePoNumber());
        po.setStatus(request.getStatus() != null ? request.getStatus() : "open");

        List<PurchaseOrderItem> items = request.getItems().stream().map(itemRequest -> {
            ProductVariant variant = productVariantRepository.findById(itemRequest.getProductVariantId())
                    .orElseThrow(() -> new RuntimeException("ProductVariant not found with id: " + itemRequest.getProductVariantId()));

            if (!variant.getProduct().getTenant().getId().equals(currentTenant.getId())) {
                throw new SecurityException("Attempted to order a product from another tenant.");
            }

            PurchaseOrderItem item = new PurchaseOrderItem();
            item.setPurchaseOrder(po);
            item.setProductVariant(variant);
            item.setQuantityOrdered(itemRequest.getQuantityOrdered());
            item.setUnitCostCents(itemRequest.getUnitCostCents());
            return item;
        }).collect(Collectors.toList());

        po.setItems(items);
        return toDto(purchaseOrderRepository.save(po));
    }

    @Transactional(readOnly = true)
    public List<PurchaseOrderDto> getAllPurchaseOrdersForCurrentTenant() {
        Tenant currentTenant = getCurrentTenant();
        return purchaseOrderRepository.findByTenantId(currentTenant.getId()).stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Optional<PurchaseOrderDto> getPurchaseOrderDtoById(Long id) {
        Tenant currentTenant = getCurrentTenant();
        return purchaseOrderRepository.findByIdAndTenantId(id, currentTenant.getId()).map(this::toDto);
    }

    public PurchaseOrderDto updatePurchaseOrder(Long id, PurchaseOrderRequest request) {
        PurchaseOrder po = purchaseOrderRepository.findByIdAndTenantId(id, getCurrentTenant().getId())
                .orElseThrow(() -> new RuntimeException("PurchaseOrder not found with id: " + id));

        // A simple update: only supplier and status. Item updates are complex and would need a different approach.
        if (request.getSupplierName() != null) {
            po.setSupplierName(request.getSupplierName());
        }
        if (request.getStatus() != null) {
            po.setStatus(request.getStatus());
        }

        // Note: This implementation does not update items.
        // A full update would require logic to add, remove, or update items, which is non-trivial.

        return toDto(purchaseOrderRepository.save(po));
    }

    private String generatePoNumber() {
        return "PO-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private PurchaseOrderDto toDto(PurchaseOrder po) {
        PurchaseOrderDto dto = new PurchaseOrderDto();
        dto.setId(po.getId());
        if (po.getStore() != null) {
            dto.setStoreId(po.getStore().getId());
            dto.setStoreName(po.getStore().getName());
        }
        dto.setPoNumber(po.getPoNumber());
        dto.setSupplierName(po.getSupplierName());
        dto.setStatus(po.getStatus());
        dto.setCreatedAt(po.getCreatedAt());
        dto.setItems(po.getItems().stream().map(this::toItemDto).collect(Collectors.toList()));
        dto.setTotalCostCents(po.getItems().stream().mapToLong(item -> item.getUnitCostCents() * item.getQuantityOrdered()).sum());
        return dto;
    }

    private PurchaseOrderItemDto toItemDto(PurchaseOrderItem item) {
        PurchaseOrderItemDto dto = new PurchaseOrderItemDto();
        dto.setId(item.getId());
        if (item.getProductVariant() != null) {
            dto.setProductVariantId(item.getProductVariant().getId());
            dto.setProductVariantSku(item.getProductVariant().getSku());
            if (item.getProductVariant().getProduct() != null) {
                dto.setProductName(item.getProductVariant().getProduct().getName());
            }
        }
        dto.setQuantityOrdered(item.getQuantityOrdered());
        dto.setUnitCostCents(item.getUnitCostCents());
        return dto;
    }
}