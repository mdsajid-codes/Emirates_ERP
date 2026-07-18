package com.example.multi_tanent.production.entity;

import com.example.multi_tanent.spersusers.enitity.Location;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "pro_work_groups")
public class ProWorkGroup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "location_id") // Optional relationship
    private Location location;

    @Column(name = "number", nullable = false, unique = true, updatable = false)
    private String number;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "designation")
    private String designation;

    @Column(name = "number_of_employees", nullable = false)
    private Integer numberOfEmployees = 0;

    @Column(name = "instance_count", nullable = false)
    private Integer instanceCount = 0;

    @Column(name = "hourly_rate", nullable = false, precision = 10, scale = 2)
    private BigDecimal hourlyRate;

    @Column(name = "fixed_working_minutes")
    private Integer fixedWorkingMinutes;

    @Column(name = "custom_working_hours", nullable = false)
    private boolean customWorkingHours = false;

    @Column(name = "color_hex", length = 7) // For hex color codes like #RRGGBB
    private String colorHex;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @OneToMany(mappedBy = "proworkgroup", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProWorkGroupDaySchedule> daySchedules;

    @PrePersist
    protected void onCreate() {
        if (this.number == null) {
            this.number = "WG-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        }
        this.createdAt = OffsetDateTime.now();
    }
}
