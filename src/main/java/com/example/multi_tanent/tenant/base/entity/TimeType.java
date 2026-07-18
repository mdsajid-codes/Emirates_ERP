package com.example.multi_tanent.tenant.base.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "time_types")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TimeType {
    @Id
    @GeneratedValue (strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, length = 50, nullable = false)
    private String code;

    @Column(length = 150, nullable = false)
    private String name;

    @Column(name = "numeric_code", length = 20)
    private String numericCode;

    @Column(name = "is_working_time")
    private Boolean isWorkingTime = false;

    @Column(name = "is_unpaid_time")
    private Boolean isUnpaidTime = false;

    
}
