package com.example.multi_tanent.tenant.payroll.service;

import com.example.multi_tanent.tenant.payroll.dto.BenefitTypeRequest;
import com.example.multi_tanent.tenant.payroll.entity.BenefitType;
import com.example.multi_tanent.tenant.payroll.repository.BenefitTypeRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(transactionManager = "tenantTx")
public class BenefitTypeService {

    private final BenefitTypeRepository benefitTypeRepository;

    public BenefitTypeService(BenefitTypeRepository benefitTypeRepository) {
        this.benefitTypeRepository = benefitTypeRepository;
    }

    public BenefitType createBenefitType(BenefitTypeRequest request) {
        BenefitType benefitType = new BenefitType();
        benefitType.setCode(request.getCode().toUpperCase());
        benefitType.setName(request.getName());
        benefitType.setDescription(request.getDescription()); // This line is correct
        benefitType.setCalculationType(request.getCalculationType()); // This line is correct
        benefitType.setValueForAccrual(request.getValueForAccrual()); // This line is correct
        benefitType.setIsActive(true);
        return benefitTypeRepository.save(benefitType);
    }

    @Transactional(readOnly = true)
    public List<BenefitType> getAllBenefitTypes() {
        return benefitTypeRepository.findAll();
    }

    public BenefitType updateBenefitType(Long id, BenefitTypeRequest request) {
        BenefitType benefitType = benefitTypeRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("BenefitType not found with id: " + id));

        benefitType.setName(request.getName());
        benefitType.setDescription(request.getDescription());
        benefitType.setCalculationType(request.getCalculationType());
        benefitType.setValueForAccrual(request.getValueForAccrual());
        return benefitTypeRepository.save(benefitType);
    }

    public BenefitType toggleActiveStatus(Long id) {
        BenefitType benefitType = benefitTypeRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("BenefitType not found with id: " + id));
        benefitType.setIsActive(!Boolean.TRUE.equals(benefitType.getIsActive()));
        return benefitTypeRepository.save(benefitType);
    }
}