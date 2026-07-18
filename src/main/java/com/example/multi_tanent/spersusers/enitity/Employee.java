package com.example.multi_tanent.spersusers.enitity;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.example.multi_tanent.spersusers.enums.EmployeeStatus;
import com.example.multi_tanent.spersusers.enums.Gender;
import com.example.multi_tanent.spersusers.enums.MartialStatus;
import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.*;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "employees")
@Getter
@Setter
@ToString(exclude = { "user", "location" })
@EqualsAndHashCode(exclude = { "user", "location" })
public class Employee {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @OneToOne(optional = false)
  @JoinColumn(name = "user_id", nullable = false, unique = true)
  @JsonBackReference("user-employee")
  private User user; // relational with users (1:1)

  @ManyToOne
  @JoinColumn(name = "location_id")
  private Location location; // Primary work location

  // Basic Details
  @Column(name = "employee_code", unique = true)
  private String employeeCode;

  @Column(name = "first_name")
  private String firstName;

  @Column(name = "middle_name")
  private String middleName;

  @Column(name = "last_name")
  private String lastName;

  @Column(name = "email_work")
  private String emailWork;

  @Column(name = "email_personal")
  private String emailPersonal;

  @Column(name = "phone_primary")
  private String phonePrimary;

  private LocalDate dob;

  @Enumerated(EnumType.STRING)
  private Gender gender;

  @Enumerated(EnumType.STRING)
  @Column(name = "martial_status")
  private MartialStatus martialStatus;

  @Enumerated(EnumType.STRING)
  private EmployeeStatus status;

  @Column(name = "photo_path")
  private String photoPath;

  @Column(name = "created_at")
  private LocalDateTime createdAt;

  @Column(name = "created_by")
  private String createdBy;

  @Column(name = "updated_at")
  private LocalDateTime updatedAt;

  @Column(name = "updated_by")
  private String updatedBy;

  public String getName() {
    return (firstName != null ? firstName : "") + " " + (lastName != null ? lastName : "");
  }

}
