package com.example.multi_tanent.production.services;

import com.example.multi_tanent.production.dto.EmployeeSlimDto;
import com.example.multi_tanent.production.dto.ProWorkStationDto;
import com.example.multi_tanent.production.dto.ProWorkStationRequest;
import com.example.multi_tanent.production.entity.ProWorkGroup;
import com.example.multi_tanent.production.entity.ProWorkStation;
import com.example.multi_tanent.production.repository.ProWorkGroupRepository;
import com.example.multi_tanent.production.repository.ProWorkStationRepository;
import com.example.multi_tanent.spersusers.enitity.Employee;
import com.example.multi_tanent.spersusers.enitity.Location;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.tenant.employee.repository.EmployeeRepository;
import com.example.multi_tanent.spersusers.repository.LocationRepository;
import com.example.multi_tanent.spersusers.repository.TenantRepository;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional("tenantTx")
public class ProWorkStationService {

    private final ProWorkStationRepository workStationRepository;
    private final ProWorkGroupRepository workGroupRepository;
    private final EmployeeRepository employeeRepository;
    private final TenantRepository tenantRepository;
    private final LocationRepository locationRepository;

    public ProWorkStationService(ProWorkStationRepository workStationRepository,
            ProWorkGroupRepository workGroupRepository, EmployeeRepository employeeRepository,
            TenantRepository tenantRepository, LocationRepository locationRepository) {
        this.workStationRepository = workStationRepository;
        this.workGroupRepository = workGroupRepository;
        this.employeeRepository = employeeRepository;
        this.tenantRepository = tenantRepository;
        this.locationRepository = locationRepository;
    }

    private Tenant getCurrentTenant() {
        return tenantRepository.findFirstByOrderByIdAsc()
                .orElseThrow(() -> new IllegalStateException("Tenant context not found."));
    }

    public ProWorkStationDto createWorkStation(ProWorkStationRequest request) {
        Tenant tenant = getCurrentTenant();
        ProWorkGroup workGroup = workGroupRepository.findById(request.getWorkGroupId())
                .orElseThrow(
                        () -> new EntityNotFoundException("Work Group not found with id: " + request.getWorkGroupId()));

        Location location = null;
        if (request.getLocationId() != null) {
            location = locationRepository.findById(request.getLocationId())
                    .orElseThrow(() -> new EntityNotFoundException(
                            "Location not found with id: " + request.getLocationId()));
        }

        List<Employee> employees = fetchEmployees(request.getEmployeeIds());

        ProWorkStation workStation = ProWorkStation.builder()
                .tenant(tenant)
                .workGroup(workGroup)
                .location(location)
                .workstationName(request.getWorkstationName())
                .employees(employees)
                .machineId(request.getMachineId())
                .machineType(request.getMachineType())
                .capacity(request.getCapacity())
                .build();

        ProWorkStation saved = workStationRepository.save(workStation);
        return toDto(saved);
    }

    public List<ProWorkStationDto> getAllWorkStations() {
        return workStationRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public ProWorkStationDto getWorkStationById(Long id) {
        return workStationRepository.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new EntityNotFoundException("Workstation not found with id: " + id));
    }

    public ProWorkStationDto updateWorkStation(Long id, ProWorkStationRequest request) {
        ProWorkStation workStation = workStationRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Workstation not found with id: " + id));

        ProWorkGroup workGroup = workGroupRepository.findById(request.getWorkGroupId())
                .orElseThrow(
                        () -> new EntityNotFoundException("Work Group not found with id: " + request.getWorkGroupId()));

        Location location = null;
        if (request.getLocationId() != null) {
            location = locationRepository.findById(request.getLocationId())
                    .orElseThrow(() -> new EntityNotFoundException(
                            "Location not found with id: " + request.getLocationId()));
        }

        List<Employee> employees = fetchEmployees(request.getEmployeeIds());

        workStation.setWorkGroup(workGroup);
        workStation.setWorkstationName(request.getWorkstationName());
        workStation.setLocation(location);
        workStation.setEmployees(employees);
        workStation.setMachineId(request.getMachineId());
        workStation.setMachineType(request.getMachineType());
        workStation.setCapacity(request.getCapacity());

        ProWorkStation updated = workStationRepository.save(workStation);
        return toDto(updated);
    }

    public void deleteWorkStation(Long id) {
        if (!workStationRepository.existsById(id)) {
            throw new EntityNotFoundException("Workstation not found with id: " + id);
        }
        workStationRepository.deleteById(id);
    }

    private List<Employee> fetchEmployees(List<Long> employeeIds) {
        return (employeeIds == null || employeeIds.isEmpty()) ? Collections.emptyList()
                : employeeRepository.findAllById(employeeIds);
    }

    private ProWorkStationDto toDto(ProWorkStation entity) {
        ProWorkStationDto dto = ProWorkStationDto.builder()
                .id(entity.getId())
                .workstationNumber(entity.getWorkstationNumber())
                .workstationName(entity.getWorkstationName())
                .workGroupName(entity.getWorkGroup().getName())
                .employees(entity.getEmployees().stream()
                        .map(emp -> new EmployeeSlimDto(emp.getId(), emp.getFirstName() + " " + emp.getLastName()))
                        .collect(Collectors.toList()))
                .machineId(entity.getMachineId())
                .machineType(entity.getMachineType())
                .capacity(entity.getCapacity())
                .createdAt(entity.getCreatedAt())
                .build();

        if (entity.getLocation() != null) {
            dto.setLocationId(entity.getLocation().getId());
            dto.setLocationName(entity.getLocation().getName());
        }

        return dto;
    }
}