package com.example.multi_tanent.crm.entity;

// src/main/java/com/example/crm/event/CrmEvent.java

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.example.multi_tanent.crm.enums.EventPriority;
import com.example.multi_tanent.crm.enums.EventStatus;
import com.example.multi_tanent.crm.enums.EventSubject;
import com.example.multi_tanent.crm.enums.MeetingType;
import com.example.multi_tanent.spersusers.enitity.Employee;
import com.example.multi_tanent.spersusers.enitity.Tenant;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;

@Entity
@Table(name = "crm_events")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CrmEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Tenant
    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    // Main subject (Call/Meeting/Event/Task/Other)
    @Enumerated(EnumType.STRING)
    @Column(name = "subject", nullable = false, length = 30)
    private EventSubject subject;

    @Column(name = "description", columnDefinition = "text")
    private String description;

    // Date & time
    @Column(name = "same_start_end", nullable = false)
    private boolean sameStartEnd;

    @Column(name = "event_date", nullable = false)
    private LocalDate date;

    @Column(name = "from_time", nullable = false)
    private LocalTime fromTime;

    @Column(name = "to_time")
    private LocalTime toTime;

    // Optional primary (customer) contact shown as “Customer Contact Name”
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "primary_contact_id")
    private Contact primaryContact;

    // Link to the lead this event is for
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lead_id", foreignKey = @ForeignKey(name = "fk_crm_event_lead"))
    private CrmLead lead;

    // Participants — employees
    @ManyToMany
    @JoinTable(name = "crm_event_employees", joinColumns = @JoinColumn(name = "event_id"), inverseJoinColumns = @JoinColumn(name = "employee_id"))
    private Set<Employee> employees = new HashSet<>();

    // Participants — additional contacts
    @ManyToMany
    @JoinTable(name = "crm_event_contacts", joinColumns = @JoinColumn(name = "event_id"), inverseJoinColumns = @JoinColumn(name = "contact_id"))
    private Set<Contact> contacts = new HashSet<>();

    // Status/Priority/Meeting type
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private EventStatus status;

    @Enumerated(EnumType.STRING)
    @Column(name = "priority", nullable = false, length = 20)
    private EventPriority priority;

    @Enumerated(EnumType.STRING)
    @Column(name = "meeting_type", length = 20)
    private MeetingType meetingType; // ONLINE / ONSITE (nullable for non-meeting)

    @Column(name = "meeting_with", length = 120)
    private String meetingWith; // e.g., “Google Meet”, “Teams” (optional)

    @CreationTimestamp
    @Column(updatable = false, name = "created_at")
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
