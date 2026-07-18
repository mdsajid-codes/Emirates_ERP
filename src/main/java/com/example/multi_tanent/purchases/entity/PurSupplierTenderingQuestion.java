package com.example.multi_tanent.purchases.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "pur_supplier_tendering_question")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurSupplierTenderingQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tendering_id", nullable = false)
    private PurSupplierTendering tendering;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id")
    private PurRfqQuestion question;

    @Column(name = "question_text", length = 1000)
    private String questionText; // Optionally store the text if the master question changes
}
