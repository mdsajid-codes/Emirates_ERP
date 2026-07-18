package com.example.multi_tanent.purchases.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "pur_rfq_response")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurRfqResponse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "response_number", unique = true, length = 100)
    private String responseNumber;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rfq_id", nullable = false)
    private PurRequestForQuotation rfq;

    @Column(name = "valid_till")
    private LocalDateTime validTill;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @Builder.Default
    @OneToMany(mappedBy = "response", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PurRfqResponseItem> items = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "response", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PurRfqResponseAnswer> answers = new ArrayList<>();

    public void addItem(PurRfqResponseItem item) {
        item.setResponse(this);
        this.items.add(item);
    }
    
    public void addAnswer(PurRfqResponseAnswer answer) {
        answer.setResponse(this);
        this.answers.add(answer);
    }
}
