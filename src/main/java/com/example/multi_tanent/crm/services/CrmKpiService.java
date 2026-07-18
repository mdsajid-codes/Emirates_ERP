package com.example.multi_tanent.crm.services;

import com.example.multi_tanent.config.TenantContext;
import java.math.BigDecimal;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.multi_tanent.crm.dto.CrmKpiEmployeeRequest;
import com.example.multi_tanent.crm.dto.CrmKpiEmployeeResponse;
import com.example.multi_tanent.crm.dto.CrmKpiRequest;
import com.example.multi_tanent.crm.dto.CrmKpiResponse;
import com.example.multi_tanent.crm.dto.CrmKpiRangeResponse;
import com.example.multi_tanent.crm.dto.EmployeeSlimDto;
import com.example.multi_tanent.crm.entity.CrmKpi;
import com.example.multi_tanent.crm.entity.CrmKpiEmployee;
import com.example.multi_tanent.crm.repository.CrmKpiRepository;
import com.example.multi_tanent.crm.repository.CrmKpiEmployeeRepository;
import com.example.multi_tanent.spersusers.enitity.Employee;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.enitity.Location;
import com.example.multi_tanent.spersusers.repository.LocationRepository;
import com.example.multi_tanent.spersusers.repository.TenantRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional("tenantTx")
public class CrmKpiService {
  private final CrmKpiRepository kpiRepo;
  private final CrmKpiEmployeeRepository kpiEmployeeRepo;
  private final com.example.multi_tanent.tenant.employee.repository.EmployeeRepository employeeRepo; // Assuming this is the correct EmployeeRepository
  private final TenantRepository tenantRepo;
  private final LocationRepository locationRepository;

  private Tenant getCurrentTenant() {
    String tenantId = TenantContext.getTenantId();
    return tenantRepo.findFirstByOrderByIdAsc()
        .orElseThrow(() -> new IllegalStateException("Tenant not found in current DB for tenantId: " + tenantId));
  }

	@Transactional(readOnly = true)
	public List<CrmKpiResponse> getAll() {
		return kpiRepo.findByTenantIdOrderByNameAsc(getCurrentTenant().getId()).stream()
				.map(this::toCrmKpiResponse)
				.collect(Collectors.toList());
	}

	@Transactional(readOnly = true)
	public CrmKpiResponse getById(Long id) {
		return kpiRepo.findByIdAndTenantId(id, getCurrentTenant().getId())
				.map(this::toCrmKpiResponse)
				.orElseThrow(() -> new ResourceNotFoundException("KPI not found with id: " + id));
	}

	public CrmKpiResponse create(CrmKpiRequest r) { // Changed return type
		Tenant t = getCurrentTenant();
		if (kpiRepo.existsByTenantIdAndNameIgnoreCase(t.getId(), r.getName())) {
			throw new IllegalArgumentException("KPI name already exists");
		}
		CrmKpi k = new CrmKpi();
		k.setTenant(t);
		k.setName(r.getName().trim());
		k.setDescription(r.getDescription());

		if (r.getLocationId() != null) {
			Location location = locationRepository.findById(r.getLocationId())
					.orElseThrow(() -> new ResourceNotFoundException("Location not found with id: " + r.getLocationId()));
			k.setLocation(location);
		}

		k.setDataType(r.getDataType());
		k.setType(r.getType());

		CrmKpi savedKpi = kpiRepo.save(k);

		if (r.getAssignedEmployees() != null && !r.getAssignedEmployees().isEmpty()) {
			Set<CrmKpiEmployee> kpiEmployees = r.getAssignedEmployees().stream()
					.map(empReq -> toCrmKpiEmployeeEntity(empReq, savedKpi))
					.collect(Collectors.toSet());
			savedKpi.setKpiEmployees(kpiEmployees);
		}
		return toCrmKpiResponse(kpiRepo.save(savedKpi));
	}

	public CrmKpiResponse update(Long id, CrmKpiRequest r) { // Changed return type
		Tenant t = getCurrentTenant();
		CrmKpi k = kpiRepo.findByIdAndTenantId(id, t.getId())
				.orElseThrow(() -> new ResourceNotFoundException("KPI not found with id: " + id));
		String newName = r.getName().trim();
		if (!k.getName().equalsIgnoreCase(newName)
				&& kpiRepo.existsByTenantIdAndNameIgnoreCase(t.getId(), newName)) {
			throw new IllegalArgumentException("KPI name already exists");
		}
		k.setName(newName);
		k.setDescription(r.getDescription());
		k.setDataType(r.getDataType());

		if (r.getLocationId() != null) {
			Location location = locationRepository.findById(r.getLocationId())
					.orElseThrow(() -> new ResourceNotFoundException("Location not found with id: " + r.getLocationId()));
			k.setLocation(location);
		} else {
			k.setLocation(null);
		}
		k.setType(r.getType());

		// Handle assigned employees: clear existing and add new ones
		k.getKpiEmployees().clear(); // orphanRemoval=true will delete old ones
		if (r.getAssignedEmployees() != null && !r.getAssignedEmployees().isEmpty()) {
			Set<CrmKpiEmployee> newKpiEmployees = r.getAssignedEmployees().stream()
					.map(empReq -> toCrmKpiEmployeeEntity(empReq, k))
					.collect(Collectors.toSet());
			k.getKpiEmployees().addAll(newKpiEmployees);
		}

		return toCrmKpiResponse(kpiRepo.save(k));
	}

	public void delete(Long id) {
		CrmKpi kpi = kpiRepo.findByIdAndTenantId(id, getCurrentTenant().getId())
				.orElseThrow(() -> new ResourceNotFoundException("KPI not found with id: " + id));
		kpiRepo.delete(kpi);
	}

	// --- Helper methods for DTO conversion ---
	private CrmKpiResponse toCrmKpiResponse(CrmKpi kpi) {
		Set<CrmKpiEmployeeResponse> assignedEmployees = kpi.getKpiEmployees().stream()
				.map(this::toCrmKpiEmployeeResponse)
				.collect(Collectors.toSet());

		Set<CrmKpiRangeResponse> ranges = kpi.getRanges().stream()
				.map(range -> {
					CrmKpiRangeResponse rangeDto = new CrmKpiRangeResponse(range.getId(), null, null, range.getFromPercent(), range.getToPercent(), range.getColor());
					if (range.getLocation() != null) {
						rangeDto.setLocationId(range.getLocation().getId());
						rangeDto.setLocationName(range.getLocation().getName());
					}
					return rangeDto;
				})
				.collect(Collectors.toSet());

		CrmKpiResponse.CrmKpiResponseBuilder builder = CrmKpiResponse.builder()
				.id(kpi.getId())
				.name(kpi.getName())
				.description(kpi.getDescription())
				.dataType(kpi.getDataType() != null ? kpi.getDataType().name() : null)
				.type(kpi.getType() != null ? kpi.getType().name() : null)
				.tenantId(kpi.getTenant().getId())
				.assignedEmployees(assignedEmployees)
				.ranges(ranges);
		if (kpi.getLocation() != null) {
			builder.locationId(kpi.getLocation().getId());
			builder.locationName(kpi.getLocation().getName());
		}
		return builder.build();
	}

	private CrmKpiEmployee toCrmKpiEmployeeEntity(CrmKpiEmployeeRequest empReq, CrmKpi kpi) {
		Employee employee = employeeRepo.findById(empReq.getEmployeeId())
				.orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + empReq.getEmployeeId()));
		return new CrmKpiEmployee(null, kpi, employee, empReq.getTargetValue());
	}

	private CrmKpiEmployeeResponse toCrmKpiEmployeeResponse(CrmKpiEmployee kpiEmployee) {
		Employee employee = kpiEmployee.getEmployee();
		EmployeeSlimDto employeeDto = new EmployeeSlimDto(employee.getId(), employee.getFirstName(), employee.getLastName()); // Correctly creating the slim DTO
		return CrmKpiEmployeeResponse.builder()
				.id(kpiEmployee.getId())
				.kpiId(kpiEmployee.getKpi().getId()) // Set the ID
				.employeeName(employee.getFirstName() + " " + employee.getLastName())
				.kpiName(kpiEmployee.getKpi().getName()) // Set the name
				.employee(employeeDto)
				.targetValue(kpiEmployee.getTargetValue() != null ? kpiEmployee.getTargetValue().doubleValue() : null)
				.build();
	}
}
