package com.example.multi_tanent.production.services;

import com.example.multi_tanent.production.dto.ProTaskDto;
import com.example.multi_tanent.production.dto.ProTaskRequest;
import com.example.multi_tanent.production.entity.ProTask;
import com.example.multi_tanent.production.repository.ProTaskRepository;
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
public class ProTaskService {

    private final ProTaskRepository taskRepository;
    private final TenantRepository tenantRepository;
    private final LocationRepository locationRepository;

    public ProTaskService(ProTaskRepository taskRepository, TenantRepository tenantRepository, LocationRepository locationRepository) {
        this.taskRepository = taskRepository;
        this.tenantRepository = tenantRepository;
        this.locationRepository = locationRepository;
    }

    private Tenant getCurrentTenant() {
        return tenantRepository.findFirstByOrderByIdAsc()
                .orElseThrow(() -> new IllegalStateException("Tenant context not found. Cannot perform operations."));
    }

    public ProTaskDto createTask(ProTaskRequest request) {
        Tenant tenant = getCurrentTenant();
        Location location = null;
        if (request.getLocationId() != null) {
            location = locationRepository.findById(request.getLocationId())
                    .orElseThrow(() -> new EntityNotFoundException("Location not found with id: " + request.getLocationId()));
        }

        ProTask task = ProTask.builder()
                .tenant(tenant)
                .location(location)
                .name(request.getName())
                .description(request.getDescription())
                .build();

        ProTask savedTask = taskRepository.save(task);
        return toDto(savedTask);
    }

    public List<ProTaskDto> getAllTasks() {
        return taskRepository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    public ProTaskDto getTaskById(Long id) {
        return taskRepository.findById(id).map(this::toDto)
                .orElseThrow(() -> new EntityNotFoundException("Task not found with id: " + id));
    }

    public ProTaskDto updateTask(Long id, ProTaskRequest request) {
        ProTask task = taskRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Task not found with id: " + id));

        Location location = null;
        if (request.getLocationId() != null) {
            location = locationRepository.findById(request.getLocationId())
                    .orElseThrow(() -> new EntityNotFoundException("Location not found with id: " + request.getLocationId()));
        }

        task.setName(request.getName());
        task.setDescription(request.getDescription());
        task.setLocation(location);

        ProTask updatedTask = taskRepository.save(task);
        return toDto(updatedTask);
    }

    public void deleteTask(Long id) {
        if (!taskRepository.existsById(id)) {
            throw new EntityNotFoundException("Task not found with id: " + id);
        }
        taskRepository.deleteById(id);
    }

    private ProTaskDto toDto(ProTask entity) {
        ProTaskDto dto = ProTaskDto.builder()
                .id(entity.getId())
                .name(entity.getName())
                .description(entity.getDescription())
                .createdAt(entity.getCreatedAt())
                .build();

        if (entity.getLocation() != null) {
            dto.setLocationId(entity.getLocation().getId());
            dto.setLocationName(entity.getLocation().getName());
        }
        return dto;
    }
}