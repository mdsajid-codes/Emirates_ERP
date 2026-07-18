package com.example.multi_tanent.tenant.employee.entity;

import java.time.LocalDate;

import com.example.multi_tanent.spersusers.enitity.Employee;
import com.example.multi_tanent.spersusers.enums.ContractType;
import com.example.multi_tanent.spersusers.enitity.Location;
import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.*;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "job_details")
@Getter
@Setter
@ToString(exclude = "employee")
@EqualsAndHashCode(exclude = "employee")
@NoArgsConstructor
@AllArgsConstructor
public class JobDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id")
    @JsonBackReference
    private Employee employee;

    @ManyToOne
    @JoinColumn(name = "location_id")
    private Location location;

    @Column(name = "actual_location")
    private String actualLocation;

    @Column(name = "department")
    private String department;

    @Column(name = "designation")
    private String designation;

    @Column(name = "job_band")
    private String jobBand;

    @Column(name = "reports_to")
    private String reportsTo;

    @Column(name = "date_of_joining")
    private LocalDate dateOfJoining;

    @Column(name = "probation_end_date")
    private LocalDate probationEndDate;

    @Column(name = "login_id")
    private String loginId;

    @Column(name = "profile_name")
    private String profileName;

    @Column(name = "employee_number")
    private String employeeNumber;

    @Column(name = "legal_entity")
    private String legalEntity;

    @Column(name = "contract_type")
    @Enumerated(EnumType.STRING)
    private ContractType contractType;
}
