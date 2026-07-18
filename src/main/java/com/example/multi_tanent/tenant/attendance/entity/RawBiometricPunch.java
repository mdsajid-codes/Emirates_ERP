package com.example.multi_tanent.tenant.attendance.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "biometric_raw_punches")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RawBiometricPunch {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "device_id", nullable = false)
    private BiometricDevice device;

    @Column(name = "raw_payload", nullable = false, columnDefinition = "TEXT")
    private String rawPayload;

    @Column(name = "punch_time")
    private LocalDateTime punchTime;

    @Column(name = "processing_status", nullable = false)
    private String processingStatus; // PENDING, PROCESSED, FAILED

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (processingStatus == null) {
            processingStatus = "PENDING";
        }
    }
}
