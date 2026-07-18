package com.example.multi_tanent.production.services;

import com.example.multi_tanent.production.dto.EmployeeSlimDto;
import com.example.multi_tanent.production.dto.ProManageTaskDto;
import com.example.multi_tanent.production.dto.ProManageTaskRequest;
import com.example.multi_tanent.production.entity.*;
import com.example.multi_tanent.production.repository.*;
import com.example.multi_tanent.spersusers.enitity.Employee;
import com.example.multi_tanent.spersusers.enitity.Location;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.LocationRepository;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import com.example.multi_tanent.tenant.employee.repository.EmployeeRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional("tenantTx")
public class ProManageTaskService {

    private final ProManageTaskRepository manageTaskRepository;
    private final TenantRepository tenantRepository;
    private final LocationRepository locationRepository;
    private final ProWorkGroupRepository workGroupRepository;
    private final ProWorkStationRepository workStationRepository;
    private final ProTaskRepository taskRepository;
    private final EmployeeRepository employeeRepository;

    public ProManageTaskService(ProManageTaskRepository manageTaskRepository, TenantRepository tenantRepository, LocationRepository locationRepository, ProWorkGroupRepository workGroupRepository, ProWorkStationRepository workStationRepository, ProTaskRepository taskRepository, EmployeeRepository employeeRepository) {
        this.manageTaskRepository = manageTaskRepository;
        this.tenantRepository = tenantRepository;
        this.locationRepository = locationRepository;
        this.workGroupRepository = workGroupRepository;
        this.workStationRepository = workStationRepository;
        this.taskRepository = taskRepository;
        this.employeeRepository = employeeRepository;
    }

    private Tenant getCurrentTenant() {
        return tenantRepository.findFirstByOrderByIdAsc()
                .orElseThrow(() -> new IllegalStateException("Tenant context not found."));
    }

    public ProManageTaskDto createManageTask(ProManageTaskRequest request) {
        Tenant tenant = getCurrentTenant();
        ProManageTask manageTask = new ProManageTask();
        mapRequestToEntity(request, manageTask, tenant);
        ProManageTask saved = manageTaskRepository.save(manageTask);
        return toDto(saved);
    }

    public List<ProManageTaskDto> getAllManageTasks() {
        return manageTaskRepository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    public ProManageTaskDto getManageTaskById(Long id) {
        return manageTaskRepository.findById(id).map(this::toDto)
                .orElseThrow(() -> new EntityNotFoundException("Managed Task not found with id: " + id));
    }

    public ProManageTaskDto updateManageTask(Long id, ProManageTaskRequest request) {
        ProManageTask manageTask = manageTaskRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Managed Task not found with id: " + id));
        mapRequestToEntity(request, manageTask, manageTask.getTenant());
        ProManageTask updated = manageTaskRepository.save(manageTask);
        return toDto(updated);
    }

    public void deleteManageTask(Long id) {
        if (!manageTaskRepository.existsById(id)) {
            throw new EntityNotFoundException("Managed Task not found with id: " + id);
        }
        manageTaskRepository.deleteById(id);
    }

    private void mapRequestToEntity(ProManageTaskRequest request, ProManageTask manageTask, Tenant tenant) {
        ProWorkGroup workGroup = workGroupRepository.findById(request.getWorkGroupId())
                .orElseThrow(() -> new EntityNotFoundException("Work Group not found with id: " + request.getWorkGroupId()));
        ProTask task = taskRepository.findById(request.getTaskId())
                .orElseThrow(() -> new EntityNotFoundException("Task not found with id: " + request.getTaskId()));

        manageTask.setTenant(tenant);
        manageTask.setWorkGroup(workGroup);
        manageTask.setTask(task);
        manageTask.setFrequency(request.getFrequency());
        manageTask.setLastPerformedOn(request.getLastPerformedOn());
        manageTask.setAlertBeforeDays(request.getAlertBeforeDays());

        if (request.getLocationId() != null) {
            Location location = locationRepository.findById(request.getLocationId())
                    .orElseThrow(() -> new EntityNotFoundException("Location not found with id: " + request.getLocationId()));
            manageTask.setLocation(location);
        } else {
            manageTask.setLocation(null);
        }

        if (request.getWorkstationId() != null) {
            ProWorkStation workstation = workStationRepository.findById(request.getWorkstationId())
                    .orElseThrow(() -> new EntityNotFoundException("Workstation not found with id: " + request.getWorkstationId()));
            manageTask.setWorkstation(workstation);
        } else {
            manageTask.setWorkstation(null);
        }

        if (request.getNotifyEmployeeIds() != null && !request.getNotifyEmployeeIds().isEmpty()) {
            Set<Employee> employees = new HashSet<>(employeeRepository.findAllById(request.getNotifyEmployeeIds()));
            manageTask.setNotifyEmployees(employees);
        } else {
            manageTask.setNotifyEmployees(Collections.emptySet());
        }
    }

    private ProManageTaskDto toDto(ProManageTask entity) {
        ProManageTaskDto.ProManageTaskDtoBuilder builder = ProManageTaskDto.builder()
                .id(entity.getId())
                .frequency(entity.getFrequency())
                .lastPerformedOn(entity.getLastPerformedOn())
                .alertBeforeDays(entity.getAlertBeforeDays())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt());

        if (entity.getLocation() != null) {
            builder.locationId(entity.getLocation().getId()).locationName(entity.getLocation().getName());
        }
        if (entity.getWorkGroup() != null) {
            builder.workGroupId(entity.getWorkGroup().getId()).workGroupName(entity.getWorkGroup().getName());
        }
        if (entity.getWorkstation() != null) {
            builder.workstationId(entity.getWorkstation().getId()).workstationName(entity.getWorkstation().getWorkstationName());
        }
        if (entity.getTask() != null) {
            builder.taskId(entity.getTask().getId()).taskName(entity.getTask().getName());
        }
        if (entity.getNotifyEmployees() != null) {
            builder.notifyEmployees(entity.getNotifyEmployees().stream()
                    .map(e -> new EmployeeSlimDto(e.getId(), e.getFirstName() + " " + e.getLastName()))
                    .collect(Collectors.toSet()));
        }

        return builder.build();
    }
}