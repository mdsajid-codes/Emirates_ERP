package com.example.multi_tanent.crm.services;


import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.multi_tanent.crm.dto.CrmKpiRangeRequest;
import com.example.multi_tanent.crm.entity.CrmKpi;
import com.example.multi_tanent.crm.entity.CrmKpiRange;
import com.example.multi_tanent.crm.repository.CrmKpiRangeRepository;
import com.example.multi_tanent.crm.repository.CrmKpiRepository;
import com.example.multi_tanent.spersusers.enitity.Location;
import com.example.multi_tanent.spersusers.repository.LocationRepository;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.config.TenantContext;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional("tenantTx")
public class CrmKpiRangeService {
  private final CrmKpiRangeRepository rangeRepo;
  private final CrmKpiRepository kpiRepo;
  private final TenantRepository tenantRepo;
  private final LocationRepository locationRepository;

  private Tenant getCurrentTenant() {
    String tenantId = TenantContext.getTenantId();
    return tenantRepo.findFirstByOrderByIdAsc()
        .orElseThrow(() -> new IllegalStateException("Tenant not found in current DB for tenantId: " + tenantId));
  }

  @Transactional(readOnly = true)
  public List<CrmKpiRange> getAllByKpi(Long kpiId) {
    // ensure KPI exists for the current tenant
    kpiRepo.findByIdAndTenantId(kpiId, getCurrentTenant().getId())
        .orElseThrow(() -> new ResourceNotFoundException("KPI not found with id: " + kpiId));
    return rangeRepo.findByKpiId(kpiId);
  }

  @Transactional(readOnly = true)
  public CrmKpiRange getById(Long kpiId, Long id) {
    // ensure KPI exists for the current tenant before fetching the range
    getAllByKpi(kpiId);
    return rangeRepo.findByIdAndKpiId(id, kpiId).orElseThrow(
        () -> new ResourceNotFoundException("KPI range not found with id: " + id));
  }

  public CrmKpiRange create(CrmKpiRangeRequest r) {
    CrmKpi kpi = kpiRepo.findByIdAndTenantId(r.getKpiId(), getCurrentTenant().getId())
        .orElseThrow(() -> new ResourceNotFoundException("KPI not found with id: " + r.getKpiId()));
    CrmKpiRange rng = new CrmKpiRange();

    if (r.getLocationId() != null) {
        Location location = locationRepository.findById(r.getLocationId())
                .orElseThrow(() -> new ResourceNotFoundException("Location not found with id: " + r.getLocationId()));
        rng.setLocation(location);
    }

    rng.setKpi(kpi);
    rng.setFromPercent(r.getFromPercent());
    rng.setToPercent(r.getToPercent());
    rng.setColor(r.getColor());
    return rangeRepo.save(rng);
  }

  public CrmKpiRange update(Long kpiId, Long id, CrmKpiRangeRequest r) {
    CrmKpiRange existing = getById(kpiId, id);
    if (r.getLocationId() != null) {
        Location location = locationRepository.findById(r.getLocationId())
                .orElseThrow(() -> new ResourceNotFoundException("Location not found with id: " + r.getLocationId()));
        existing.setLocation(location);
    } else {
        existing.setLocation(null);
    }
    existing.setFromPercent(r.getFromPercent());
    existing.setToPercent(r.getToPercent());
    existing.setColor(r.getColor());
    return rangeRepo.save(existing);
  }

  public void delete(Long kpiId, Long id) {
    rangeRepo.delete(getById(kpiId, id));
  }
}
