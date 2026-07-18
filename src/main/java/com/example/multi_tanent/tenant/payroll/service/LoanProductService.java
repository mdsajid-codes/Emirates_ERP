package com.example.multi_tanent.tenant.payroll.service;

import com.example.multi_tanent.tenant.payroll.dto.LoanProductRequest;
import com.example.multi_tanent.tenant.payroll.entity.LoanProduct;
import com.example.multi_tanent.tenant.payroll.repository.LoanProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional(transactionManager = "tenantTx")
public class LoanProductService {

    private final LoanProductRepository loanProductRepository;

    public LoanProductService(LoanProductRepository loanProductRepository) {
        this.loanProductRepository = loanProductRepository;
    }

    public List<LoanProduct> getAllLoanProducts() {
        return loanProductRepository.findAll();
    }

    public Optional<LoanProduct> getLoanProductById(Long id) {
        return loanProductRepository.findById(id);
    }

    public LoanProduct createLoanProduct(LoanProductRequest request) {
        LoanProduct loanProduct = new LoanProduct();
        mapRequestToEntity(request, loanProduct);
        return loanProductRepository.save(loanProduct);
    }

    public LoanProduct updateLoanProduct(Long id, LoanProductRequest request) {
        LoanProduct loanProduct = loanProductRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("LoanProduct not found with id: " + id));
        mapRequestToEntity(request, loanProduct);
        return loanProductRepository.save(loanProduct);
    }

    public void deleteLoanProduct(Long id) {
        loanProductRepository.deleteById(id);
    }

    private void mapRequestToEntity(LoanProductRequest req, LoanProduct entity) {
        entity.setProductName(req.getProductName());
        entity.setDescription(req.getDescription());
        entity.setInterestRate(req.getInterestRate());
        entity.setMaxInstallments(req.getMaxInstallments());
        entity.setMaxLoanAmount(req.getMaxLoanAmount());
        entity.setIsActive(req.getIsActive());
        entity.setAvailabilityStartDate(req.getAvailabilityStartDate());
        entity.setAvailabilityEndDate(req.getAvailabilityEndDate());
        entity.setDeductFromSalary(req.getDeductFromSalary());
    }
}