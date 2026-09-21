package com.example.multi_tanent.master.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "demo_requests")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DemoRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(nullable = false)
    private String email;

    private String phone;

    private String company;

    /** Free-form module name: "POS", "HRMS", "CRM", etc. No constraint so future modules work without a schema change. */
    @Column(length = 100)
    private String module;

    /** Number of POS terminals required, e.g. "1-2 terminals" */
    private String terminals;

    /** Business type e.g. "Retail Store", "Restaurant", etc. */
    @Column(name = "business_type", length = 100)
    private String businessType;

    @Column(columnDefinition = "TEXT")
    private String message;

    /** Traffic source identifier, e.g. "Website Demo Request" */
    private String source;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private DemoRequestStatus status;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @Column(name = "reviewed_by")
    private String reviewedBy;

    @Column(name = "review_notes", columnDefinition = "TEXT")
    private String reviewNotes;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null) {
            status = DemoRequestStatus.PENDING;
        }
    }
}
