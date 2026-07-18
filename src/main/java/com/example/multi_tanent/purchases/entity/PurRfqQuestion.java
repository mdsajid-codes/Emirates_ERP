package com.example.multi_tanent.purchases.entity;

import com.example.multi_tanent.spersusers.enitity.Tenant;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "pur_rfq_question")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurRfqQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "question_text", length = 1000)
    private String questionText;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id")
    private Tenant tenant;
}
