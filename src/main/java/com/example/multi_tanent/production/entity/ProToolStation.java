package com.example.multi_tanent.production.entity;

import com.example.multi_tanent.spersusers.enitity.Tenant;
import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "pro_tool_stations")
public class ProToolStation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tool_id")
    private ProTools tool;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "position")
    private Integer position;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    // @OneToMany(mappedBy = "toolStation", cascade = CascadeType.ALL, orphanRemoval
    // = true)
    // private List<ProTools> tools = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdAt = OffsetDateTime.now();
    }
}
