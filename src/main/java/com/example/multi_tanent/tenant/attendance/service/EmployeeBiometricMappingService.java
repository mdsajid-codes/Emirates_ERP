package com.example.multi_tanent.tenant.attendance.service;

import com.example.multi_tanent.spersusers.enitity.Employee;
import com.example.multi_tanent.tenant.attendance.dto.EmployeeBiometricMappingRequest;
import com.example.multi_tanent.tenant.attendance.entity.BiometricDevice;
import com.example.multi_tanent.tenant.attendance.entity.EmployeeBiometricMapping;
import com.example.multi_tanent.tenant.attendance.repository.BiometricDeviceRepository;
import com.example.multi_tanent.tenant.attendance.repository.EmployeeBiometricMappingRepository;
import com.example.multi_tanent.tenant.employee.repository.EmployeeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional(transactionManager = "tenantTx")
public class EmployeeBiometricMappingService {

    private final EmployeeBiometricMappingRepository mappingRepository;
    private final EmployeeRepository employeeRepository;
    private final BiometricDeviceRepository deviceRepository;

    public EmployeeBiometricMappingService(EmployeeBiometricMappingRepository mappingRepository,
                                           EmployeeRepository employeeRepository,
                                           BiometricDeviceRepository deviceRepository) {
        this.mappingRepository = mappingRepository;
        this.employeeRepository = employeeRepository;
        this.deviceRepository = deviceRepository;
    }

    public EmployeeBiometricMapping createMapping(EmployeeBiometricMappingRequest request) {
        Employee employee;
        if (request.getEmployeeId() != null) {
            employee = employeeRepository.findById(request.getEmployeeId())
                    .orElseThrow(() -> new RuntimeException("Employee not found with id: " + request.getEmployeeId()));
        } else {
            employee = employeeRepository.findByEmployeeCode(request.getEmployeeCode())
                    .orElseThrow(() -> new RuntimeException("Employee not found with code: " + request.getEmployeeCode()));
        }

        BiometricDevice device = null;
        if (request.getDeviceId() != null) {
            device = deviceRepository.findById(request.getDeviceId())
                    .orElseThrow(() -> new RuntimeException("Biometric device not found with id: " + request.getDeviceId()));
        }

        String bioId = request.getBiometricId() != null ? request.getBiometricId() : request.getBiometricIdentifier();

        EmployeeBiometricMapping mapping = new EmployeeBiometricMapping();
        mapping.setEmployee(employee);
        mapping.setDevice(device);
        mapping.setBiometricIdentifier(bioId);
        mapping.setBiometricTemplate(request.getBiometricTemplate());
        mapping.setIdentifierType(request.getIdentifierType());
        mapping.setActive(request.getActive() != null ? request.getActive() : true);
        mapping.setExternalReference(request.getExternalReference());
        mapping.setCreatedAt(LocalDateTime.now());
        mapping.setUpdatedAt(LocalDateTime.now());

        return mappingRepository.save(mapping);
    }

    @Transactional(readOnly = true)
    public List<EmployeeBiometricMapping> getAllMappings() {
        return mappingRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<EmployeeBiometricMapping> getMappingById(Long id) {
        return mappingRepository.findById(id);
    }

    public EmployeeBiometricMapping updateMapping(Long id, EmployeeBiometricMappingRequest request) {
        EmployeeBiometricMapping mapping = mappingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Mapping not found with id: " + id));

        Employee employee;
        if (request.getEmployeeId() != null) {
            employee = employeeRepository.findById(request.getEmployeeId())
                    .orElseThrow(() -> new RuntimeException("Employee not found with id: " + request.getEmployeeId()));
        } else {
            employee = employeeRepository.findByEmployeeCode(request.getEmployeeCode())
                    .orElseThrow(() -> new RuntimeException("Employee not found with code: " + request.getEmployeeCode()));
        }

        BiometricDevice device = null;
        if (request.getDeviceId() != null) {
            device = deviceRepository.findById(request.getDeviceId())
                    .orElseThrow(() -> new RuntimeException("Biometric device not found with id: " + request.getDeviceId()));
        }

        String bioId = request.getBiometricId() != null ? request.getBiometricId() : request.getBiometricIdentifier();

        mapping.setEmployee(employee);
        mapping.setDevice(device);
        mapping.setBiometricIdentifier(bioId);
        mapping.setBiometricTemplate(request.getBiometricTemplate());
        mapping.setIdentifierType(request.getIdentifierType());
        mapping.setActive(request.getActive() != null ? request.getActive() : mapping.getActive());
        mapping.setExternalReference(request.getExternalReference());
        mapping.setUpdatedAt(LocalDateTime.now());

        return mappingRepository.save(mapping);
    }

    public void deleteMapping(Long id) {
        if (!mappingRepository.existsById(id)) {
            throw new RuntimeException("Mapping not found with id: " + id);
        }
        mappingRepository.deleteById(id);
    }
}