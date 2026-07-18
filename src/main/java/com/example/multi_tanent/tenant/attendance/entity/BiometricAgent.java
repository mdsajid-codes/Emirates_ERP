package com.example.multi_tanent.tenant.attendance.entity;

import com.example.multi_tanent.tenant.attendance.enums.BiometricAgentStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "biometric_agents")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BiometricAgent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "agent_name", nullable = false)
    private String agentName;

    @Column(name = "last_seen")
    private LocalDateTime lastSeen;

    @Column(name = "version")
    private String version;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private BiometricAgentStatus status; // ONLINE, OFFLINE

    @Column(name = "ip_address")
    private String ipAddress;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null) {
            status = BiometricAgentStatus.OFFLINE;
        }
    }
}
