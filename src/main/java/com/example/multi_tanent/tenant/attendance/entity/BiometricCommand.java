package com.example.multi_tanent.tenant.attendance.entity;

import com.example.multi_tanent.tenant.attendance.enums.BiometricCommandStatus;
import com.example.multi_tanent.tenant.attendance.enums.BiometricCommandType;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "biometric_commands")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BiometricCommand {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "device_id", nullable = false)
    private BiometricDevice device;

    @Enumerated(EnumType.STRING)
    @Column(name = "command_type", nullable = false)
    private BiometricCommandType commandType; // REBOOT, SYNC_TIME, CLEAR_LOGS, SYNC_TEMPLATE

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private BiometricCommandStatus status; // PENDING, EXECUTED, FAILED

    @Column(name = "payload", columnDefinition = "TEXT")
    private String payload; // JSON parameters for the command

    @Column(name = "response_message", columnDefinition = "TEXT")
    private String responseMessage;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "executed_at")
    private LocalDateTime executedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null) {
            status = BiometricCommandStatus.PENDING;
        }
    }
}
