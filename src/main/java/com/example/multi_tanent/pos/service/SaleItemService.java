package com.example.multi_tanent.pos.service;

import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.pos.dto.SaleItemRequest;
import com.example.multi_tanent.pos.entity.Sale;
import com.example.multi_tanent.pos.entity.SaleItem;
import com.example.multi_tanent.pos.repository.SaleItemRepository;
import com.example.multi_tanent.pos.repository.SaleRepository;
import com.example.multi_tanent.spersusers.enitity.CrmSalesProduct;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
@Transactional("tenantTx")
public class SaleItemService {

    private final SaleItemRepository saleItemRepository;
    private final SaleRepository saleRepository;
    private final TenantRepository tenantRepository;

    public SaleItemService(SaleItemRepository saleItemRepository,
                           SaleRepository saleRepository,
                           TenantRepository tenantRepository) {
        this.saleItemRepository = saleItemRepository;
        this.saleRepository = saleRepository;
        this.tenantRepository = tenantRepository;
    }

    private Tenant getCurrentTenant() {
        String tenantIdStr = TenantContext.getTenantId();
        if (tenantIdStr == null || tenantIdStr.isEmpty()) {
            throw new IllegalStateException("Tenant context is not set.");
        }
        return tenantRepository.findByTenantId(tenantIdStr)
                .orElseThrow(() -> new RuntimeException("Tenant not found with identifier: " + tenantIdStr));
    }

    private Sale getSaleForCurrentTenant(Long saleId) {
        Tenant currentTenant = getCurrentTenant();
        return saleRepository.findByIdAndTenantId(saleId, currentTenant.getId())
                .orElseThrow(() -> new RuntimeException("Sale not found with id: " + saleId));
    }

    @Transactional(readOnly = true)
    public List<SaleItem> getItemsBySaleId(Long saleId) {
        getSaleForCurrentTenant(saleId);
        return saleItemRepository.findBySaleId(saleId);
    }

    @Transactional(readOnly = true)
    public Optional<SaleItem> getItemById(Long saleId, Long itemId) {
        getSaleForCurrentTenant(saleId);
        return saleItemRepository.findByIdAndSaleId(itemId, saleId);
    }

    public SaleItem updateSaleItem(Long saleId, Long itemId, SaleItemRequest itemRequest) {
        Sale sale = getSaleForCurrentTenant(saleId);
        if ("completed".equals(sale.getStatus()) || "refunded".equals(sale.getStatus())) {
            throw new IllegalStateException("Cannot update items in a completed or refunded sale.");
        }

        SaleItem saleItem = saleItemRepository.findByIdAndSaleId(itemId, saleId)
                .orElseThrow(() -> new RuntimeException("SaleItem not found with id: " + itemId));

        saleItem.setQuantity(itemRequest.getQuantity());
        CrmSalesProduct product = saleItem.getProduct();
        long unitPriceCents = product != null && product.getSalesPrice() != null
                ? product.getSalesPrice().multiply(BigDecimal.valueOf(100)).longValue() : saleItem.getUnitPriceCents();

        saleItem.setUnitPriceCents(unitPriceCents);
        saleItem.setLineTotalCents(unitPriceCents * itemRequest.getQuantity());

        long lineTax = 0L;
        if (product != null && product.getTaxRate() != null) {
            lineTax = (long) ((saleItem.getLineTotalCents() * product.getTaxRate()) / 100);
        }
        saleItem.setTaxCents(lineTax);

        recalculateSaleTotals(sale);
        saleRepository.save(sale);  
        return saleItem;
    }

    public void deleteSaleItem(Long saleId, Long itemId) {
        Sale sale = getSaleForCurrentTenant(saleId);
        if ("completed".equals(sale.getStatus()) || "refunded".equals(sale.getStatus())) {
            throw new IllegalStateException("Cannot delete items from a completed or refunded sale.");
        }

        SaleItem saleItem = saleItemRepository.findByIdAndSaleId(itemId, saleId)
                .orElseThrow(() -> new RuntimeException("SaleItem not found with id: " + itemId));

        sale.getItems().remove(saleItem);
        saleItemRepository.delete(saleItem);

        recalculateSaleTotals(sale);
        saleRepository.save(sale);
    }

    private void recalculateSaleTotals(Sale sale) {
        long subtotal = 0L;
        long totalTax = 0L;

        for (SaleItem item : sale.getItems()) {
            subtotal += item.getLineTotalCents();
            totalTax += item.getTaxCents();
        }

        sale.setSubtotalCents(subtotal);
        sale.setTaxCents(totalTax);
        sale.setTotalCents(subtotal + totalTax - sale.getDiscountCents());
    }
}