package com.example.multi_tanent.crm.repository;



import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

import com.example.multi_tanent.crm.entity.CrmKpiRange;


public interface CrmKpiRangeRepository extends JpaRepository<CrmKpiRange, Long> {
  List<CrmKpiRange> findByKpiId(Long kpiId);
  Optional<CrmKpiRange> findByIdAndKpiId(Long id, Long kpiId);
}

