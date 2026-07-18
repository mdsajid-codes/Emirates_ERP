package com.example.multi_tanent.tenant.payroll.service;

import com.example.multi_tanent.spersusers.enitity.Employee;
import com.example.multi_tanent.tenant.employee.repository.EmployeeRepository;
import com.example.multi_tanent.tenant.payroll.dto.SalaryStructureRequest;
import com.example.multi_tanent.tenant.payroll.dto.SyncSalaryStructureRequest;
import com.example.multi_tanent.tenant.payroll.entity.SalaryComponent;
import com.example.multi_tanent.tenant.payroll.entity.SalaryStructure;
import com.example.multi_tanent.tenant.payroll.entity.SalaryStructureComponent;
import com.example.multi_tanent.tenant.payroll.repository.SalaryComponentRepository;
import com.example.multi_tanent.tenant.payroll.repository.SalaryStructureRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional(transactionManager = "tenantTx")
public class SalaryStructureService {

    private final SalaryStructureRepository salaryStructureRepository;
    private final EmployeeRepository employeeRepository;
    private final SalaryComponentRepository salaryComponentRepository;

    public SalaryStructureService(SalaryStructureRepository salaryStructureRepository,
                                  EmployeeRepository employeeRepository,
                                  SalaryComponentRepository salaryComponentRepository) {
        this.salaryStructureRepository = salaryStructureRepository;
        this.employeeRepository = employeeRepository;
        this.salaryComponentRepository = salaryComponentRepository;
    }

    public SalaryStructure createSalaryStructure(SalaryStructureRequest request) {
        Employee employee = employeeRepository.findByEmployeeCode(request.getEmployeeCode())
                .orElseThrow(() -> new EntityNotFoundException("Employee not found with code: " + request.getEmployeeCode()));

        if (salaryStructureRepository.findByEmployeeId(employee.getId()).isPresent()) {
            throw new IllegalStateException("A salary structure already exists for this employee.");
        }

        SalaryStructure structure = new SalaryStructure();
        structure.setEmployee(employee);
        return updateStructureFromRequest(structure, request);
    }

    public SalaryStructure updateSalaryStructure(Long id, SalaryStructureRequest request) {
        SalaryStructure structure = salaryStructureRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("SalaryStructure not found with id: " + id));
        return updateStructureFromRequest(structure, request);
    }

    public void syncStructure(SyncSalaryStructureRequest request) {
        SalaryStructure sourceStructure = salaryStructureRepository.findById(request.getStructureId())
                .orElseThrow(() -> new EntityNotFoundException("Source salary structure not found."));

        for (String employeeCode : request.getEmployeeCodes()) {
            Employee targetEmployee = employeeRepository.findByEmployeeCode(employeeCode)
                    .orElseThrow(() -> new EntityNotFoundException("Employee not found with code: " + employeeCode));

            SalaryStructure targetStructure = salaryStructureRepository.findByEmployeeId(targetEmployee.getId())
                    .orElse(new SalaryStructure());

            targetStructure.setEmployee(targetEmployee);
            targetStructure.setStructureName(targetEmployee.getFirstName() + "'s Structure"); // Generate a unique name
            targetStructure.setEffectiveDate(sourceStructure.getEffectiveDate());

            // Clear old components and copy new ones
            targetStructure.getComponents().clear();
            for (SalaryStructureComponent sourceComp : sourceStructure.getComponents()) { // Fix: The method setStructure(SalaryStructure) is undefined for the type SalaryStructureComponent
                SalaryStructureComponent newComp = new SalaryStructureComponent();
                newComp.setSalaryStructure(targetStructure);
                newComp.setSalaryComponent(sourceComp.getSalaryComponent());
                newComp.setValue(sourceComp.getValue());
                newComp.setFormula(sourceComp.getFormula());
                targetStructure.getComponents().add(newComp);
            }
            salaryStructureRepository.save(targetStructure);
        }
    }

    private SalaryStructure updateStructureFromRequest(SalaryStructure structure, SalaryStructureRequest request) {
        structure.setStructureName(request.getStructureName());
        structure.setEffectiveDate(request.getEffectiveDate());

        // Clear existing components to handle updates and removals
        structure.getComponents().clear();

        if (request.getComponents() != null) {
            for (SalaryStructureRequest.ComponentRequest compReq : request.getComponents()) {
                SalaryComponent salaryComponent = salaryComponentRepository.findByCode(compReq.getComponentCode())
                        .orElseThrow(() -> new EntityNotFoundException("SalaryComponent not found with code: " + compReq.getComponentCode()));

                SalaryStructureComponent ssc = new SalaryStructureComponent();
                ssc.setSalaryStructure(structure);
                ssc.setSalaryComponent(salaryComponent);
                ssc.setValue(compReq.getValue());
                ssc.setFormula(compReq.getFormula());
                structure.getComponents().add(ssc);
            }
        }
        return salaryStructureRepository.save(structure);
    }

    public Optional<SalaryStructure> getSalaryStructureByEmployeeCode(String employeeCode) {
        return employeeRepository.findByEmployeeCode(employeeCode)
                .flatMap(employee -> salaryStructureRepository.findByEmployeeIdWithDetails(employee.getId()));
    }

    public List<SalaryStructure> getAllSalaryStructures() {
        return salaryStructureRepository.findAll();
    }

    public void deleteSalaryStructure(Long id) {
        salaryStructureRepository.deleteById(id);
    }
}