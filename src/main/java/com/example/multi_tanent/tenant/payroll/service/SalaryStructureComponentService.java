package com.example.multi_tanent.tenant.payroll.service;

import com.example.multi_tanent.tenant.payroll.entity.SalaryStructureComponent;
import com.example.multi_tanent.tenant.payroll.repository.SalaryStructureComponentRepository;
import com.example.multi_tanent.tenant.payroll.repository.SalaryStructureRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(transactionManager = "tenantTx", readOnly = true)
public class SalaryStructureComponentService {

    private final SalaryStructureComponentRepository componentRepository;
    private final SalaryStructureRepository structureRepository;

    public SalaryStructureComponentService(SalaryStructureComponentRepository componentRepository, SalaryStructureRepository structureRepository) {
        this.componentRepository = componentRepository;
        this.structureRepository = structureRepository;
    }

    public List<SalaryStructureComponent> getComponentsByStructureId(Long structureId) {
        structureRepository.findById(structureId)
                .orElseThrow(() -> new RuntimeException("SalaryStructure not found with id: " + structureId));
        return componentRepository.findBySalaryStructureId(structureId);
    }
}