package com.example.multi_tanent.hanger.repository;

import com.example.multi_tanent.hanger.entity.HngMachineDowntimeLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HngMachineDowntimeLogRepository extends JpaRepository<HngMachineDowntimeLog, Long> {
    List<HngMachineDowntimeLog> findByWorkStation_IdAndTenantId(Long workstationId, Long tenantId);

    List<HngMachineDowntimeLog> findByBatch_IdAndTenantId(Long batchId, Long tenantId);
}
