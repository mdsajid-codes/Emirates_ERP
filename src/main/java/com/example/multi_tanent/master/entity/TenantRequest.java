package com.example.multi_tanent.master.entity;

import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Type;

import java.util.List;

@Entity
@Table(name = "tenant_request")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TenantRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tenant_id")
    private String tenantId;

    @Column(name = "company_name")
    private String companyName;

    @Column(name = "admin_email")
    String adminEmail;

    @Column(name = "admin_password")
    String adminPassword; // Note: Storing plain-text password is a security risk.

    @Type(JsonType.class)
    @Column(name = "service_modules", columnDefinition = "json")
    private List<ServiceModule> serviceModules;
}
