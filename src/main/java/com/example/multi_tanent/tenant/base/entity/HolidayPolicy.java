package com.example.multi_tanent.tenant.base.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "holiday_policies")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HolidayPolicy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(name = "region_code", length = 10)
    private String regionCode; // e.g., "UAE", "IND", "GLOBAL"

    @Column(nullable = false)
    private int year;

    @OneToMany(mappedBy = "policy", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<Holiday> holidays = new ArrayList<>();
}
