package com.example.multi_tanent.master.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "my_custom_fields")
@Getter
@Setter
public class MyCustomField {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Relationship
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "my_company_info_id")
    @JsonIgnore
    private MyCompanyInfo myCompanyInfo;

    // Fields
    @Column(name = "field_name", nullable = false)
    private String fieldName;

    @Column(name = "field_value", columnDefinition = "TEXT")
    private String fieldValue;

    // Optional: Type of field if needed (text, number, date, etc.)
    @Column(name = "field_type")
    private String fieldType;

    // Optional: For document attachments
    @Column(name = "document_name")
    private String documentName;

    @Column(name = "document_url")
    private String documentUrl;
}
