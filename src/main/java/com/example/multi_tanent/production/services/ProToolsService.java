package com.example.multi_tanent.production.services;

import com.example.multi_tanent.production.dto.*;
import com.example.multi_tanent.production.entity.*;
import com.example.multi_tanent.production.repository.ProToolCategoryRepository;
import com.example.multi_tanent.production.repository.ProToolsRepository;
import com.example.multi_tanent.production.repository.ProWorkGroupRepository;
import com.example.multi_tanent.production.repository.ProWorkStationRepository;
import com.example.multi_tanent.spersusers.enitity.Location;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.LocationRepository;
import com.example.multi_tanent.spersusers.repository.TenantRepository;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional("tenantTx")
public class ProToolsService {

    private final ProToolsRepository toolsRepository;
    private final TenantRepository tenantRepository;
    private final LocationRepository locationRepository;
    private final ProWorkGroupRepository workGroupRepository;
    private final ProWorkStationRepository workStationRepository;
    private final ProToolCategoryRepository toolCategoryRepository;

    public ProToolsService(ProToolsRepository toolsRepository, TenantRepository tenantRepository, LocationRepository locationRepository, ProWorkGroupRepository workGroupRepository, ProWorkStationRepository workStationRepository, ProToolCategoryRepository toolCategoryRepository) {
        this.toolsRepository = toolsRepository;
        this.tenantRepository = tenantRepository;
        this.locationRepository = locationRepository;
        this.workGroupRepository = workGroupRepository;
        this.workStationRepository = workStationRepository;
        this.toolCategoryRepository = toolCategoryRepository;
    }

    private Tenant getCurrentTenant() {
        return tenantRepository.findFirstByOrderByIdAsc()
                .orElseThrow(() -> new IllegalStateException("Tenant context not found. Cannot perform operations."));
    }

    public ProToolsDto createTool(ProToolsRequest request) {
        Tenant tenant = getCurrentTenant();

        // Fetch related entities
        ProWorkGroup workGroup = workGroupRepository.findById(request.getWorkGroupId())
                .orElseThrow(() -> new EntityNotFoundException("Work Group not found with id: " + request.getWorkGroupId()));
        ProToolCategory category = toolCategoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new EntityNotFoundException("Tool Category not found with id: " + request.getCategoryId()));

        Location location = null;
        if (request.getLocationId() != null) {
            location = locationRepository.findById(request.getLocationId())
                    .orElseThrow(() -> new EntityNotFoundException("Location not found with id: " + request.getLocationId()));
        }

        ProWorkStation workstation = null;
        if (request.getWorkstationId() != null) {
            workstation = workStationRepository.findById(request.getWorkstationId())
                    .orElseThrow(() -> new EntityNotFoundException("Workstation not found with id: " + request.getWorkstationId()));
        }

        ProTools tool = ProTools.builder()
                .tenant(tenant)
                .name(request.getName())
                .manufacturingDate(request.getManufacturingDate())
                .workGroup(workGroup)
                .workstation(workstation)
                .category(category)
                .location(location)
                .build();

        // Map and set child entities
        if (request.getStations() != null) {
            List<ProToolStation> stations = request.getStations().stream()
                    .map(stationReq -> ProToolStation.builder()
                            .tenant(tenant)
                            .tool(tool)
                            .name(stationReq.getName())
                            .position(stationReq.getPosition())
                            .build())
                    .collect(Collectors.toList());
            tool.setStations(stations);
        }

        if (request.getParameters() != null) {
            List<ToolParameter> parameters = request.getParameters().stream()
                    .map(paramReq -> {
                        ToolParameter parameter = ToolParameter.builder()
                                .tenant(tenant)
                                .tool(tool)
                                .name(paramReq.getName())
                                .build();
                        if (paramReq.getValues() != null) {
                            List<ToolParameterValue> values = paramReq.getValues().stream()
                                    .map(valueReq -> ToolParameterValue.builder()
                                            .tenant(tenant)
                                            .parameter(parameter)
                                            .value(valueReq.getValue())
                                            .position(valueReq.getPosition())
                                            .build())
                                    .collect(Collectors.toList());
                            parameter.setValues(values);
                        }
                        return parameter;
                    })
                    .collect(Collectors.toList());
            tool.setParameters(parameters);
        }

        ProTools savedTool = toolsRepository.save(tool);
        return toDto(savedTool);
    }

    public List<ProToolsDto> getAllTools() {
        return toolsRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public ProToolsDto getToolById(Long id) {
        return toolsRepository.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new EntityNotFoundException("Tool not found with id: " + id));
    }

    public ProToolsDto updateTool(Long id, ProToolsRequest request) {
        Tenant tenant = getCurrentTenant();
        ProTools tool = toolsRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Tool not found with id: " + id));

        // Fetch related entities
        ProWorkGroup workGroup = workGroupRepository.findById(request.getWorkGroupId())
                .orElseThrow(() -> new EntityNotFoundException("Work Group not found with id: " + request.getWorkGroupId()));
        ProToolCategory category = toolCategoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new EntityNotFoundException("Tool Category not found with id: " + request.getCategoryId()));

        Location location = null;
        if (request.getLocationId() != null) {
            location = locationRepository.findById(request.getLocationId())
                    .orElseThrow(() -> new EntityNotFoundException("Location not found with id: " + request.getLocationId()));
        }

        ProWorkStation workstation = null;
        if (request.getWorkstationId() != null) {
            workstation = workStationRepository.findById(request.getWorkstationId())
                    .orElseThrow(() -> new EntityNotFoundException("Workstation not found with id: " + request.getWorkstationId()));
        }

        // Update main fields
        tool.setName(request.getName());
        tool.setManufacturingDate(request.getManufacturingDate());
        tool.setWorkGroup(workGroup);
        tool.setWorkstation(workstation);
        tool.setCategory(category);
        tool.setLocation(location);

        // Clear and re-add child collections
        tool.getStations().clear();
        if (request.getStations() != null) {
            request.getStations().forEach(stationReq -> tool.getStations().add(ProToolStation.builder()
                    .tenant(tenant).tool(tool).name(stationReq.getName()).position(stationReq.getPosition()).build()));
        }

        tool.getParameters().clear();
        if (request.getParameters() != null) {
            request.getParameters().forEach(paramReq -> {
                ToolParameter parameter = ToolParameter.builder().tenant(tenant).tool(tool).name(paramReq.getName()).build();
                if (paramReq.getValues() != null) {
                    paramReq.getValues().forEach(valueReq -> parameter.getValues().add(ToolParameterValue.builder()
                            .tenant(tenant).parameter(parameter).value(valueReq.getValue()).position(valueReq.getPosition()).build()));
                }
                tool.getParameters().add(parameter);
            });
        }

        ProTools updatedTool = toolsRepository.save(tool);
        return toDto(updatedTool);
    }

    public void deleteTool(Long id) {
        if (!toolsRepository.existsById(id)) {
            throw new EntityNotFoundException("Tool not found with id: " + id);
        }
        toolsRepository.deleteById(id);
    }

    private ProToolsDto toDto(ProTools entity) {
        ProToolsDto.ProToolsDtoBuilder builder = ProToolsDto.builder()
                .id(entity.getId())
                .name(entity.getName())
                .manufacturingDate(entity.getManufacturingDate())
                .createdAt(entity.getCreatedAt());

        if (entity.getWorkGroup() != null) {
            builder.workGroupId(entity.getWorkGroup().getId());
            builder.workGroupName(entity.getWorkGroup().getName());
        }
        if (entity.getWorkstation() != null) {
            builder.workstationId(entity.getWorkstation().getId());
            builder.workstationName(entity.getWorkstation().getWorkstationName());
        }
        if (entity.getCategory() != null) {
            builder.categoryId(entity.getCategory().getId());
            builder.categoryName(entity.getCategory().getName());
        }
        if (entity.getLocation() != null) {
            builder.locationId(entity.getLocation().getId());
            builder.locationName(entity.getLocation().getName());
        }

        List<ProToolStationDto> stationDtos = entity.getStations() != null ?
                entity.getStations().stream()
                        .map(s -> new ProToolStationDto(s.getId(), s.getName(), s.getPosition()))
                        .collect(Collectors.toList()) : new ArrayList<>();
        builder.stations(stationDtos);

        List<ToolParameterDto> parameterDtos = entity.getParameters() != null ?
                entity.getParameters().stream()
                        .map(p -> new ToolParameterDto(p.getId(), p.getName(),
                                p.getValues() != null ? p.getValues().stream()
                                        .map(v -> new ToolParameterValueDto(v.getId(), v.getValue(), v.getPosition()))
                                        .collect(Collectors.toList()) : new ArrayList<>()))
                        .collect(Collectors.toList()) : new ArrayList<>();
        builder.parameters(parameterDtos);

        return builder.build();
    }

}