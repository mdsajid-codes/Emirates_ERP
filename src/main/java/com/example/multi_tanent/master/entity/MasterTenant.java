package com.example.multi_tanent.master.entity;

import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.*;

import java.time.LocalDate;

import org.hibernate.annotations.Type;

import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "master_tenant", uniqueConstraints = @UniqueConstraint(columnNames = "tenantId"))
@Getter
@Setter
public class MasterTenant {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "tenant_id", nullable = false, unique = true)
  private String tenantId;

  @Column(name = "company_name", nullable = false)
  private String companyName;

  @Column(name = "jdbc_url", nullable = false)
  private String jdbcUrl;

  @Column(nullable = false)
  private String username;

  @Column(nullable = false)
  private String password;

  // Store selected modules as a JSON array of strings in the database
  @Type(JsonType.class)
  @Column(name = "service_modules", columnDefinition = "json")
  private java.util.List<ServiceModule> serviceModules;

  // Subscription Details
  @Column(name = "number_of_locations")
  private Integer numberOfLocations;

  @Column(name = "number_of_users")
  private Integer numberOfUsers;

  @Column(name = "hrms_access_count")
  private Integer hrmsAccessCount;

  @Column(name = "number_of_store")
  private Integer numberOfStore;

  @Column(name = "subscription_start_date")
  private LocalDate subscriptionStartDate;

  @Column(name = "subscription_end_date")
  private LocalDate subscriptionEndDate;

  @Enumerated(EnumType.STRING)
  private SubscriptionStatus status = SubscriptionStatus.PENDING;

  public String[] getEntityPackages() {
    return ServiceModule.getPackagesForModules(this.serviceModules);
  }

  // getters/setters
}
