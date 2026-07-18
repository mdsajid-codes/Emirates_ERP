package com.example.multi_tanent.purchases.service.impl;

import com.example.multi_tanent.accounts.repository.coa.ChartOfAccountRepository;
import com.example.multi_tanent.accounts.repository.ExpenseItemRepository;
import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.production.repository.ProRawMaterialsRepository;
import com.example.multi_tanent.purchases.dto.PurCustomDeclarationLineRequest;
import com.example.multi_tanent.purchases.dto.PurCustomDeclarationLineResponse;
import com.example.multi_tanent.purchases.dto.PurCustomDeclarationRequest;
import com.example.multi_tanent.purchases.dto.PurCustomDeclarationResponse;
import com.example.multi_tanent.purchases.entity.PurCustomDeclaration;
import com.example.multi_tanent.purchases.entity.PurCustomDeclarationLine;
import com.example.multi_tanent.purchases.entity.PurPurchaseInvoice;
import com.example.multi_tanent.purchases.repository.PurCustomDeclarationRepository;
import com.example.multi_tanent.purchases.repository.PurPurchaseInvoiceRepository;
import com.example.multi_tanent.purchases.service.PurCustomDeclarationService;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import com.example.multi_tanent.spersusers.repository.UserRepository;
import com.example.multi_tanent.tenant.base.repository.DepartmentRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional("tenantTx")
public class PurCustomDeclarationServiceImpl implements PurCustomDeclarationService {

    private final PurCustomDeclarationRepository repo;
    private final PurPurchaseInvoiceRepository invoiceRepo;
    private final TenantRepository tenantRepo;
    private final UserRepository userRepo;
    private final ChartOfAccountRepository coaRepo;
    private final DepartmentRepository deptRepo;
    private final ExpenseItemRepository expenseItemRepo;
    private final ProRawMaterialsRepository itemRepo;

    private Tenant currentTenant() {
        String key = TenantContext.getTenantId();
        return tenantRepo.findByTenantId(key)
                .orElseThrow(() -> new IllegalStateException("Tenant not resolved for key: " + key));
    }

    @Override
    public PurCustomDeclarationResponse create(PurCustomDeclarationRequest request) {
        Tenant t = currentTenant();
        PurCustomDeclaration entity = new PurCustomDeclaration();
        mapToEntity(request, entity);
        entity.setTenant(t);
        entity.setCreatedAt(LocalDateTime.now());

        calculateTotals(entity);
        PurCustomDeclaration saved = repo.save(entity);
        return toResponse(saved);
    }

    @Override
    public PurCustomDeclarationResponse update(Long id, PurCustomDeclarationRequest request) {
        PurCustomDeclaration entity = repo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Custom Declaration not found: " + id));
        mapToEntity(request, entity);

        calculateTotals(entity);
        PurCustomDeclaration saved = repo.save(entity);
        return toResponse(saved);
    }

    @Override
    public PurCustomDeclarationResponse getById(Long id) {
        PurCustomDeclaration entity = repo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Custom Declaration not found: " + id));
        return toResponse(entity);
    }

    @Override
    public List<PurCustomDeclarationResponse> getAll() {
        Tenant t = currentTenant();
        return repo.findAllByTenant(t).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public void delete(Long id) {
        repo.deleteById(id);
    }

    @Override
    public PurCustomDeclarationResponse generateFromInvoices(List<Long> invoiceIds) {
        PurCustomDeclaration declaration = new PurCustomDeclaration();
        declaration.setLines(new ArrayList<>());
        
        int lineNumber = 1;
        for (Long invoiceId : invoiceIds) {
            PurPurchaseInvoice invoice = invoiceRepo.findById(invoiceId)
                    .orElseThrow(() -> new EntityNotFoundException("Invoice not found: " + invoiceId));
            
            for (var invLine : invoice.getLines()) {
                PurCustomDeclarationLine declLine = new PurCustomDeclarationLine();
                declLine.setLineNumber(lineNumber++);
                declLine.setPurchaseInvoice(invoice);
                declLine.setItem(invLine.getItem());
                declLine.setCifForeignValue(invLine.getAmount());
                declLine.setExchangeRate(BigDecimal.ONE); // Default
                declLine.setCifNationalValue(invLine.getAmount());
                declLine.setVatRate(invLine.getTaxPercent() != null ? invLine.getTaxPercent() : BigDecimal.ZERO);
                
                declaration.addLine(declLine);
            }
        }
        
        // This is a "preview" generation, not saved yet
        return toResponse(declaration);
    }

    private void mapToEntity(PurCustomDeclarationRequest request, PurCustomDeclaration entity) {
        entity.setDeclarationNumber(request.getDeclarationNumber());
        entity.setIsThirdPartyClearance(request.getIsThirdPartyClearance());
        entity.setCompanyName(request.getCompanyName());
        entity.setTaxIsDue(request.getTaxIsDue());
        entity.setServiceCharge(request.getServiceCharge());
        entity.setIsApplyCustomPenalty(request.getIsApplyCustomPenalty());
        entity.setCustomPenaltyAmount(request.getCustomPenaltyAmount());
        entity.setBusinessActivity(request.getBusinessActivity());
        entity.setEntityName(request.getEntityName());
        entity.setIsGroupByHSCode(request.getIsGroupByHSCode());
        entity.setIsIncludeServiceCharge(request.getIsIncludeServiceCharge());
        entity.setStatus(request.getStatus());

        if (request.getExpenseAccountId() != null) {
            entity.setExpenseAccount(coaRepo.findById(request.getExpenseAccountId()).orElse(null));
        }
        if (request.getDepartmentId() != null) {
            entity.setDepartment(deptRepo.findById(request.getDepartmentId()).orElse(null));
        }
        if (request.getExpenseItemId() != null) {
            entity.setExpenseItem(expenseItemRepo.findById(request.getExpenseItemId()).orElse(null));
        }
        if (request.getResponsiblePersonId() != null) {
            entity.setResponsiblePerson(userRepo.findById(request.getResponsiblePersonId()).orElse(null));
        }

        // Map lines
        if (request.getLines() != null) {
            entity.getLines().clear();
            for (var lineReq : request.getLines()) {
                PurCustomDeclarationLine line = new PurCustomDeclarationLine();
                line.setLineNumber(lineReq.getLineNumber());
                line.setHsCode(lineReq.getHsCode());
                line.setOrigin(lineReq.getOrigin());
                line.setCifForeignValue(lineReq.getCifForeignValue());
                line.setExchangeRate(lineReq.getExchangeRate());
                line.setDutyRate(lineReq.getDutyRate());
                line.setVatRate(lineReq.getVatRate());
                
                if (lineReq.getPurchaseInvoiceId() != null) {
                    line.setPurchaseInvoice(invoiceRepo.findById(lineReq.getPurchaseInvoiceId()).orElse(null));
                }
                if (lineReq.getItemId() != null) {
                    line.setItem(itemRepo.findById(lineReq.getItemId()).orElse(null));
                }
                
                entity.addLine(line);
            }
        }
    }

    private void calculateTotals(PurCustomDeclaration entity) {
        BigDecimal cifForeignTotal = BigDecimal.ZERO;
        BigDecimal cifNationalTotal = BigDecimal.ZERO;
        BigDecimal totalServiceCharge = Optional.ofNullable(entity.getServiceCharge()).orElse(BigDecimal.ZERO);

        // Step 1: Basic line calculations (CIF National and Duty)
        for (var line : entity.getLines()) {
            BigDecimal foreign = Optional.ofNullable(line.getCifForeignValue()).orElse(BigDecimal.ZERO);
            BigDecimal rate = Optional.ofNullable(line.getExchangeRate()).orElse(BigDecimal.ONE);
            BigDecimal national = foreign.multiply(rate);
            line.setCifNationalValue(national);
            
            BigDecimal dutyRate = Optional.ofNullable(line.getDutyRate()).orElse(BigDecimal.ZERO);
            BigDecimal dutyAmount = national.multiply(dutyRate).divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);
            line.setDutyAmount(dutyAmount);
            
            cifForeignTotal = cifForeignTotal.add(foreign);
            cifNationalTotal = cifNationalTotal.add(national);
        }

        // Step 2: Service Charge Allocation
        if (totalServiceCharge.compareTo(BigDecimal.ZERO) > 0 && cifNationalTotal.compareTo(BigDecimal.ZERO) > 0) {
            for (var line : entity.getLines()) {
                BigDecimal allocation = line.getCifNationalValue()
                        .multiply(totalServiceCharge)
                        .divide(cifNationalTotal, 4, RoundingMode.HALF_UP);
                line.setServiceChargeAllocation(allocation);
            }
        } else {
            for (var line : entity.getLines()) {
                line.setServiceChargeAllocation(BigDecimal.ZERO);
            }
        }

        // Step 3: VAT calculation
        BigDecimal vatTotal = BigDecimal.ZERO;
        BigDecimal totalDuty = BigDecimal.ZERO;
        for (var line : entity.getLines()) {
            BigDecimal baseForVat = line.getCifNationalValue().add(line.getDutyAmount());
            if (Boolean.TRUE.equals(entity.getIsIncludeServiceCharge())) {
                baseForVat = baseForVat.add(line.getServiceChargeAllocation());
            }
            
            BigDecimal vatRate = Optional.ofNullable(line.getVatRate()).orElse(BigDecimal.ZERO);
            BigDecimal vatAmount = baseForVat.multiply(vatRate).divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);
            line.setVatAmount(vatAmount);
            
            vatTotal = vatTotal.add(vatAmount);
            totalDuty = totalDuty.add(line.getDutyAmount());
        }

        entity.setCifForeignValueTotal(cifForeignTotal);
        entity.setCifNationalValueTotal(cifNationalTotal);
        entity.setVatReverseChargeTotal(vatTotal);
        
        BigDecimal penalties = Optional.ofNullable(entity.getCustomPenaltyAmount()).orElse(BigDecimal.ZERO);
        entity.setTotalDue(totalDuty.add(totalServiceCharge).add(penalties));
    }

    private PurCustomDeclarationResponse toResponse(PurCustomDeclaration entity) {
        PurCustomDeclarationResponse response = new PurCustomDeclarationResponse();
        response.setId(entity.getId());
        response.setDeclarationNumber(entity.getDeclarationNumber());
        response.setIsThirdPartyClearance(entity.getIsThirdPartyClearance());
        response.setCompanyName(entity.getCompanyName());
        response.setTaxIsDue(entity.getTaxIsDue());
        response.setServiceCharge(entity.getServiceCharge());
        response.setIsApplyCustomPenalty(entity.getIsApplyCustomPenalty());
        response.setCustomPenaltyAmount(entity.getCustomPenaltyAmount());
        response.setBusinessActivity(entity.getBusinessActivity());
        response.setEntityName(entity.getEntityName());
        response.setIsGroupByHSCode(entity.getIsGroupByHSCode());
        response.setIsIncludeServiceCharge(entity.getIsIncludeServiceCharge());
        response.setStatus(entity.getStatus());
        response.setCifForeignValueTotal(entity.getCifForeignValueTotal());
        response.setCifNationalValueTotal(entity.getCifNationalValueTotal());
        response.setVatReverseChargeTotal(entity.getVatReverseChargeTotal());
        response.setTotalDue(entity.getTotalDue());
        response.setCreatedAt(entity.getCreatedAt());
        response.setCreatedBy(entity.getCreatedBy());

        if (entity.getExpenseAccount() != null) {
            response.setExpenseAccountId(entity.getExpenseAccount().getAccountId());
            response.setExpenseAccountName(entity.getExpenseAccount().getDescription());
        }
        if (entity.getDepartment() != null) {
            response.setDepartmentId(entity.getDepartment().getId());
            response.setDepartmentName(entity.getDepartment().getName());
        }
        if (entity.getExpenseItem() != null) {
            response.setExpenseItemId(entity.getExpenseItem().getExpenseItemId());
            response.setExpenseItemDescription(entity.getExpenseItem().getDescription());
        }
        if (entity.getResponsiblePerson() != null) {
            response.setResponsiblePersonId(entity.getResponsiblePerson().getId());
            response.setResponsiblePersonName(entity.getResponsiblePerson().getName());
        }

        List<PurCustomDeclarationLineResponse> lineResponses = Optional.ofNullable(entity.getLines())
                .orElse(Collections.emptyList())
                .stream()
                .map(line -> {
                    PurCustomDeclarationLineResponse lr = new PurCustomDeclarationLineResponse();
                    lr.setId(line.getId());
                    lr.setLineNumber(line.getLineNumber());
                    lr.setHsCode(line.getHsCode());
                    lr.setOrigin(line.getOrigin());
                    lr.setCifForeignValue(line.getCifForeignValue());
                    lr.setExchangeRate(line.getExchangeRate());
                    lr.setCifNationalValue(line.getCifNationalValue());
                    lr.setDutyRate(line.getDutyRate());
                    lr.setDutyAmount(line.getDutyAmount());
                    lr.setServiceChargeAllocation(line.getServiceChargeAllocation());
                    lr.setVatRate(line.getVatRate());
                    lr.setVatAmount(line.getVatAmount());
                    
                    if (line.getPurchaseInvoice() != null) {
                        lr.setPurchaseInvoiceId(line.getPurchaseInvoice().getId());
                        lr.setPurchaseInvoiceNumber(line.getPurchaseInvoice().getBillNumber());
                    }
                    if (line.getItem() != null) {
                        lr.setItemId(line.getItem().getId());
                        lr.setItemName(line.getItem().getName());
                    }
                    return lr;
                })
                .collect(Collectors.toList());
        
        response.setLines(lineResponses);
        return response;
    }
}
