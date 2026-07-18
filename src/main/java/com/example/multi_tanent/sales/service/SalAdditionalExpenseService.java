package com.example.multi_tanent.sales.service;

import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.production.enums.ItemType;
import com.example.multi_tanent.production.repository.*;
import com.example.multi_tanent.sales.dto.*;
import com.example.multi_tanent.sales.entity.*;
import com.example.multi_tanent.sales.repository.*;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import com.example.multi_tanent.spersusers.repository.PartyRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional("tenantTx")
public class SalAdditionalExpenseService {

    private final SalAdditionalExpenseRepository repository;
    private final TenantRepository tenantRepository;
    private final PartyRepository partyRepository;
    private final SalesOrderRepository salesOrderRepository;
    private final ProTaxRepository taxRepository;
    private final ProUnitRepository unitRepository;
    private final ProRawMaterialsRepository rawMaterialsRepository;
    private final ProFinishedGoodRepository finishedGoodRepository;
    private final ProSemiFinishedRepository semiFinishedRepository;

    private Tenant getCurrentTenant() {
        String tenantId = TenantContext.getTenantId();
        return tenantRepository.findByTenantId(tenantId)
                .or(() -> {
                    System.out.println("WARN: Tenant record not found for ID: " + tenantId + ". Falling back to first record.");
                    return tenantRepository.findFirstByOrderByIdAsc();
                })
                .orElseThrow(() -> new IllegalStateException("No tenant record found in database."));
    }

    public SalAdditionalExpenseResponse create(SalAdditionalExpenseRequest request) {
        Tenant tenant = getCurrentTenant();
        SalAdditionalExpense ae = new SalAdditionalExpense();
        mapRequestToEntity(request, ae, tenant);
        
        if (ae.getNumber() == null || ae.getNumber().isBlank()) {
            ae.setNumber("AE-SAL-" + System.currentTimeMillis());
        }

        SalAdditionalExpense saved = repository.save(ae);
        return mapEntityToResponse(saved);
    }

    @Transactional(readOnly = true)
    public Page<SalAdditionalExpenseResponse> getAll(Pageable pageable) {
        Long tenantId = getCurrentTenant().getId();
        return repository.findByTenantId(tenantId, pageable)
                .map(this::mapEntityToResponse);
    }

    @Transactional(readOnly = true)
    public SalAdditionalExpenseResponse getById(Long id) {
        Long tenantId = getCurrentTenant().getId();
        return repository.findByTenantIdAndId(tenantId, id)
                .map(this::mapEntityToResponse)
                .orElseThrow(() -> new EntityNotFoundException("Additional Expense not found with id: " + id));
    }

    public SalAdditionalExpenseResponse update(Long id, SalAdditionalExpenseRequest request) {
        Tenant tenant = getCurrentTenant();
        SalAdditionalExpense ae = repository.findByTenantIdAndId(tenant.getId(), id)
                .orElseThrow(() -> new EntityNotFoundException("Additional Expense not found with id: " + id));

        ae.getExpenseLines().clear();
        ae.getInventoryItems().clear();
        mapRequestToEntity(request, ae, tenant);

        SalAdditionalExpense saved = repository.save(ae);
        return mapEntityToResponse(saved);
    }

    public void delete(Long id) {
        Long tenantId = getCurrentTenant().getId();
        SalAdditionalExpense ae = repository.findByTenantIdAndId(tenantId, id)
                .orElseThrow(() -> new EntityNotFoundException("Additional Expense not found with id: " + id));
        repository.delete(ae);
    }

    @Transactional(readOnly = true)
    public List<SalAdditionalExpenseProduct> getServiceRelatedProducts() {
        Long tenantId = getCurrentTenant().getId();
        List<SalAdditionalExpenseProduct> results = new ArrayList<>();

        rawMaterialsRepository.findByTenantId(tenantId).stream()
                .filter(p -> p.getItemType() == com.example.multi_tanent.production.enums.ItemType.SERVICE)
                .forEach(p -> results.add(SalAdditionalExpenseProduct.builder()
                        .id(p.getId()).name(p.getName()).itemCode(p.getItemCode()).itemType(p.getItemType()).category("RM").build()));

        semiFinishedRepository.findByTenantId(tenantId).stream()
                .filter(p -> p.getItemType() == com.example.multi_tanent.production.enums.ItemType.SERVICE)
                .forEach(p -> results.add(SalAdditionalExpenseProduct.builder()
                        .id(p.getId()).name(p.getName()).itemCode(p.getItemCode()).itemType(p.getItemType()).category("SFG").build()));

        finishedGoodRepository.findByTenantId(tenantId).stream()
                .filter(p -> p.getItemType() == com.example.multi_tanent.production.enums.ItemType.SERVICE)
                .forEach(p -> results.add(SalAdditionalExpenseProduct.builder()
                        .id(p.getId()).name(p.getName()).itemCode(p.getItemCode()).itemType(p.getItemType()).category("FG").build()));

        return results;
    }

    private void mapRequestToEntity(SalAdditionalExpenseRequest request, SalAdditionalExpense entity, Tenant tenant) {
        entity.setTenant(tenant);
        entity.setNumber(request.getNumber());
        entity.setDate(request.getDate());
        entity.setContract(request.getContract());
        entity.setTransactionType(request.getTransactionType());
        entity.setCurrency(request.getCurrency());
        entity.setExchangeRate(request.getExchangeRate());
        entity.setComment(request.getComment());
        entity.setStatus(request.getStatus());

        if (request.getCompanyId() != null) {
            entity.setCompany(partyRepository.findById(request.getCompanyId()).orElse(null));
        }

        if (request.getSalesOrderId() != null) {
            entity.setSalesOrder(salesOrderRepository.findById(request.getSalesOrderId()).orElse(null));
        }

        BigDecimal totalAmount = BigDecimal.ZERO;

        if (request.getExpenseLines() != null) {
            for (SalAdditionalExpenseLineRequest lineReq : request.getExpenseLines()) {
                SalAdditionalExpenseLine line = new SalAdditionalExpenseLine();
                line.setAmount(lineReq.getAmount());
                line.setTaxAmount(lineReq.getTaxAmount());
                line.setTotalAmount(lineReq.getTotalAmount());
                if (lineReq.getProductId() != null) {
                    line.setProductId(lineReq.getProductId());
                }
                if (lineReq.getTaxId() != null) {
                    line.setTax(taxRepository.findById(lineReq.getTaxId()).orElse(null));
                }
                entity.addExpenseLine(line);
                totalAmount = totalAmount.add(line.getTotalAmount());
            }
        }

        if (request.getInventoryItems() != null) {
            for (SalAdditionalExpenseInventoryRequest invReq : request.getInventoryItems()) {
                SalAdditionalExpenseInventory item = new SalAdditionalExpenseInventory();
                item.setDocumentType(invReq.getDocumentType());
                item.setDocumentId(invReq.getDocumentId());
                item.setProductId(invReq.getProductId());
                item.setBatch(invReq.getBatch());
                item.setQuantity(invReq.getQuantity());
                item.setPrice(invReq.getPrice());
                item.setAmount(invReq.getAmount());
                item.setFactor(invReq.getFactor());
                item.setExpenseAmount(invReq.getExpenseAmount());
                if (invReq.getUnitId() != null) {
                    item.setUnit(unitRepository.findById(invReq.getUnitId()).orElse(null));
                }
                entity.addInventoryItem(item);
            }
        }
        
        entity.setTotalAmount(totalAmount);
    }

    private SalAdditionalExpenseResponse mapEntityToResponse(SalAdditionalExpense entity) {
        List<SalAdditionalExpenseLineResponse> lines = entity.getExpenseLines().stream().map(l -> {
            String prodName = "N/A";
            String itemCode = "";
            String category = "";
            
            if (l.getProductId() != null) {
                var rm = rawMaterialsRepository.findById(l.getProductId());
                if (rm.isPresent()) {
                    prodName = rm.get().getName();
                    itemCode = rm.get().getItemCode();
                    category = "RM";
                } else {
                    var sf = semiFinishedRepository.findById(l.getProductId());
                    if (sf.isPresent()) {
                        prodName = sf.get().getName();
                        itemCode = sf.get().getItemCode();
                        category = "SFG";
                    } else {
                        var fg = finishedGoodRepository.findById(l.getProductId());
                        if (fg.isPresent()) {
                            prodName = fg.get().getName();
                            itemCode = fg.get().getItemCode();
                            category = "FG";
                        }
                    }
                }
            }

            return SalAdditionalExpenseLineResponse.builder()
                .id(l.getId())
                .productId(l.getProductId())
                .productName(prodName)
                .itemCode(itemCode)
                .category(category)
                .amount(l.getAmount())
                .taxId(l.getTax() != null ? l.getTax().getId() : null)
                .taxCode(l.getTax() != null ? l.getTax().getCode() : null)
                .taxAmount(l.getTaxAmount())
                .totalAmount(l.getTotalAmount())
                .build();
        }).collect(Collectors.toList());

        List<SalAdditionalExpenseInventoryResponse> items = entity.getInventoryItems().stream().map(i -> {
            String prodName = "";
            String itemCode = "";
            var rm = rawMaterialsRepository.findById(i.getProductId());
            if (rm.isPresent()) {
                prodName = rm.get().getName();
                itemCode = rm.get().getItemCode();
            } else {
                var fg = finishedGoodRepository.findById(i.getProductId());
                if (fg.isPresent()) {
                    prodName = fg.get().getName();
                    itemCode = fg.get().getItemCode();
                }
            }

            return SalAdditionalExpenseInventoryResponse.builder()
                .id(i.getId())
                .documentType(i.getDocumentType())
                .documentId(i.getDocumentId())
                .productId(i.getProductId())
                .productName(prodName)
                .itemCode(itemCode)
                .batch(i.getBatch())
                .quantity(i.getQuantity())
                .unitId(i.getUnit() != null ? i.getUnit().getId() : null)
                .unitName(i.getUnit() != null ? i.getUnit().getName() : null)
                .price(i.getPrice())
                .amount(i.getAmount())
                .factor(i.getFactor())
                .expenseAmount(i.getExpenseAmount())
                .build();
        }).collect(Collectors.toList());

        return SalAdditionalExpenseResponse.builder()
            .id(entity.getId())
            .number(entity.getNumber())
            .date(entity.getDate())
            .companyId(entity.getCompany() != null ? entity.getCompany().getId() : null)
            .companyName(entity.getCompany() != null ? entity.getCompany().getCompanyName() : null)
            .contract(entity.getContract())
            .transactionType(entity.getTransactionType())
            .salesOrderId(entity.getSalesOrder() != null ? entity.getSalesOrder().getId() : null)
            .salesOrderNumber(entity.getSalesOrder() != null ? entity.getSalesOrder().getSalesOrderNumber() : null)
            .currency(entity.getCurrency())
            .exchangeRate(entity.getExchangeRate())
            .comment(entity.getComment())
            .status(entity.getStatus())
            .totalAmount(entity.getTotalAmount())
            .expenseLines(lines)
            .inventoryItems(items)
            .createdBy(entity.getCreatedBy())
            .createdAt(entity.getCreatedAt())
            .build();
    }
}
