package com.example.multi_tanent.crm.entity;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.Set;
import com.example.multi_tanent.crm.enums.KpiType;
import com.example.multi_tanent.crm.enums.KpidataType;
import com.example.multi_tanent.spersusers.enitity.Location;
import com.example.multi_tanent.spersusers.enitity.Tenant;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "crm_kpis")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CrmKpi {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(optional = false, fetch = FetchType.LAZY)
  @JoinColumn(name = "tenant_id", nullable = false)
  private Tenant tenant;

  /** Optional: The location where this KPI is relevant */
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "location_id", foreignKey = @ForeignKey(name = "fk_kpi_location"))
  private Location location;

  private String name;
  private String description;

  @Enumerated(EnumType.STRING)
  @Column(name = "data_type")
  private KpidataType dataType;

  @Enumerated(EnumType.STRING)
  @Column(name = "type")
  private KpiType type;

  @OneToMany(mappedBy = "kpi", cascade = CascadeType.ALL, orphanRemoval = true)
  private Set<CrmKpiEmployee> kpiEmployees = new HashSet<>();

  @OneToMany(mappedBy = "kpi", cascade = CascadeType.ALL, orphanRemoval = true)
  private Set<CrmKpiRange> ranges = new HashSet<>();
}
