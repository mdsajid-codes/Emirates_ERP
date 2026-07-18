package com.example.multi_tanent.tenant.attendance.entity;

import com.example.multi_tanent.spersusers.enitity.Employee;
import com.example.multi_tanent.tenant.attendance.enums.IdentifierType;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "employee_biometric_mappings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeBiometricMapping {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @JsonProperty("employeeName")
    public String getEmployeeName() {
        return employee != null ? employee.getName() : null;
    }

    @JsonProperty("employeeCode")
    public String getEmployeeCode() {
        return employee != null ? employee.getEmployeeCode() : null;
    }

    @JsonProperty("employeeId")
    public Long getEmployeeId() {
        return employee != null ? employee.getId() : null;
    }

    @JsonIgnore
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "device_id", nullable = false)
    private BiometricDevice device;

    @JsonProperty("deviceName")
    public String getDeviceName() {
        return device != null ? device.getDeviceIdentifier() : "N/A";
    }

    @JsonProperty("deviceId")
    public Long getDeviceId() {
        return device != null ? device.getId() : null;
    }

    @JsonProperty("biometricId")
    public String getBiometricId() {
        return biometricIdentifier;
    }

    @Column(nullable = false, name = "biometric_identifier")
    private String biometricIdentifier;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, name = "identifier_type")
    private IdentifierType identifierType;

    @Column(name = "active")
    private Boolean active;
    @Column(name = "external_reference")
    private String externalReference; // e.g., vendor-specific template ID

    @Column(name = "biometric_template", columnDefinition = "TEXT")
    private String biometricTemplate; // Base64 encoded template data

    @Column(name = "created_at")
    private java.time.LocalDateTime createdAt;
    @Column(name = "updated_at")
    private java.time.LocalDateTime updatedAt;
}
