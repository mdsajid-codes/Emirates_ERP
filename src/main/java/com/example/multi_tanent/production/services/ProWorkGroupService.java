package com.example.multi_tanent.production.services;

import com.example.multi_tanent.production.dto.ProWorkGroupDto;
import com.example.multi_tanent.production.dto.ProWorkGroupRequest;
import com.example.multi_tanent.production.dto.ProWorkGroupDayScheduleDto;
import com.example.multi_tanent.production.entity.ProWorkGroup;
import com.example.multi_tanent.production.entity.ProWorkGroupDaySchedule;
import com.example.multi_tanent.production.repository.ProWorkGroupRepository;
import com.example.multi_tanent.spersusers.enitity.Location;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.LocationRepository;
import com.example.multi_tanent.spersusers.repository.TenantRepository;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional("tenantTx")
public class ProWorkGroupService {

    private final ProWorkGroupRepository workGroupRepository;
    private final TenantRepository tenantRepository;
    private final LocationRepository locationRepository;

    public ProWorkGroupService(ProWorkGroupRepository workGroupRepository, TenantRepository tenantRepository, LocationRepository locationRepository) {
        this.workGroupRepository = workGroupRepository;
        this.tenantRepository = tenantRepository;
        this.locationRepository = locationRepository;
    }

    private Tenant getCurrentTenant() {
        return tenantRepository.findFirstByOrderByIdAsc()
                .orElseThrow(() -> new IllegalStateException("Tenant context not found. Cannot perform operations."));
    }

    public ProWorkGroupDto createWorkGroup(ProWorkGroupRequest request) {
        Tenant tenant = getCurrentTenant();
        Location location = null;
        if (request.getLocationId() != null) {
            location = locationRepository.findById(request.getLocationId())
                    .orElseThrow(() -> new EntityNotFoundException("Location not found with id: " + request.getLocationId()));
        }

        ProWorkGroup workGroup = ProWorkGroup.builder()
                .tenant(tenant)
                .location(location)
                .name(request.getName())
                .designation(request.getDesignation())
                .numberOfEmployees(request.getNumberOfEmployees())
                .instanceCount(request.getInstanceCount())
                .hourlyRate(request.getHourlyRate())
                .fixedWorkingMinutes(request.getFixedWorkingMinutes())
                .customWorkingHours(request.isCustomWorkingHours())
                .colorHex(request.getColorHex())
                .build();

        if (request.getDaySchedules() != null) {
            List<ProWorkGroupDaySchedule> schedules = request.getDaySchedules().stream()
                    .map(dto -> toScheduleEntity(dto, workGroup))
                    .collect(Collectors.toList());
            workGroup.setDaySchedules(schedules);
        }

        ProWorkGroup saved = workGroupRepository.save(workGroup);
        return toDto(saved);
    }

    public List<ProWorkGroupDto> getAllWorkGroups() {
        return workGroupRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public ProWorkGroupDto getWorkGroupById(Long id) {
        return workGroupRepository.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new EntityNotFoundException("Work Group not found with id: " + id));
    }

    public ProWorkGroupDto updateWorkGroup(Long id, ProWorkGroupRequest request) {
        ProWorkGroup workGroup = workGroupRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Work Group not found with id: " + id));

        Location location = null;
        if (request.getLocationId() != null) {
            location = locationRepository.findById(request.getLocationId())
                    .orElseThrow(() -> new EntityNotFoundException("Location not found with id: " + request.getLocationId()));
        }

        workGroup.setLocation(location);
        workGroup.setName(request.getName());
        workGroup.setDesignation(request.getDesignation());
        workGroup.setNumberOfEmployees(request.getNumberOfEmployees());
        workGroup.setInstanceCount(request.getInstanceCount());
        workGroup.setHourlyRate(request.getHourlyRate());
        workGroup.setFixedWorkingMinutes(request.getFixedWorkingMinutes());
        workGroup.setCustomWorkingHours(request.isCustomWorkingHours());
        workGroup.setColorHex(request.getColorHex());

        // Update schedules
        workGroup.getDaySchedules().clear();
        workGroupRepository.flush(); // Force the DELETE statements to execute now
        if (request.getDaySchedules() != null) {
            request.getDaySchedules().forEach(dto -> workGroup.getDaySchedules().add(toScheduleEntity(dto, workGroup)));
        }

        ProWorkGroup updated = workGroupRepository.save(workGroup);
        return toDto(updated);
    }

    public void deleteWorkGroup(Long id) {
        if (!workGroupRepository.existsById(id)) {
            throw new EntityNotFoundException("Work Group not found with id: " + id);
        }
        workGroupRepository.deleteById(id);
    }

    private ProWorkGroupDto toDto(ProWorkGroup entity) {
        List<ProWorkGroupDayScheduleDto> scheduleDtos = entity.getDaySchedules() != null ?
                entity.getDaySchedules().stream().map(this::toScheduleDto).collect(Collectors.toList()) : List.of();

        ProWorkGroupDto dto = ProWorkGroupDto.builder()
                .id(entity.getId()).number(entity.getNumber()).name(entity.getName()).designation(entity.getDesignation())
                .numberOfEmployees(entity.getNumberOfEmployees())
                .instanceCount(entity.getInstanceCount()).hourlyRate(entity.getHourlyRate())
                .fixedWorkingMinutes(entity.getFixedWorkingMinutes()).customWorkingHours(entity.isCustomWorkingHours())
                .colorHex(entity.getColorHex()).createdAt(entity.getCreatedAt()).daySchedules(scheduleDtos)
                .build();

        if (entity.getLocation() != null) {
            dto.setLocationId(entity.getLocation().getId());
            dto.setLocationName(entity.getLocation().getName());
        }

        return dto;
    }

    private ProWorkGroupDayScheduleDto toScheduleDto(ProWorkGroupDaySchedule entity) {
        return new ProWorkGroupDayScheduleDto(entity.getDayOfWeek(), entity.getStartTime(), entity.getEndTime());
    }

    private ProWorkGroupDaySchedule toScheduleEntity(ProWorkGroupDayScheduleDto dto, ProWorkGroup workGroup) {
        ProWorkGroupDaySchedule schedule = new ProWorkGroupDaySchedule();
        schedule.setProworkgroup(workGroup);
        schedule.setDayOfWeek(dto.getDayOfWeek());
        schedule.setStartTime(dto.getStartTime());
        schedule.setEndTime(dto.getEndTime());
        return schedule;
    }
}