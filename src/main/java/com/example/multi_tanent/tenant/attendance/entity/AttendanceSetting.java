package com.example.multi_tanent.tenant.attendance.entity;

import com.example.multi_tanent.tenant.attendance.enums.AttendanceMethod;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "attendance_settings")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceSetting {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "method")
    private AttendanceMethod method; // MANUAL, BIOMETRIC, RFID, GPS, APP

    @Column(name = "default_grace_minutes")
    private Integer defaultGraceMinutes;

    @Column(name = "auto_mark_absent_after")
    private Boolean autoMarkAbsentAfter;

    @Column(name = "absent_after_minutes")
    private Integer absentAfterMinutes; // e.g., if not checked-in within this minutes, mark absent

}
