package com.example.multi_tanent.purchases.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "pur_rfq_response_answer")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurRfqResponseAnswer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "response_id", nullable = false)
    private PurRfqResponse response;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private PurSupplierTenderingQuestion question;

    @Column(name = "answer", length = 2000)
    private String answer;
}
