package com.example.multi_tanent.purchases.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "pur_request_for_quotation")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurRequestForQuotation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "rfq_number", unique = true, length = 100)
    private String rfqNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tendering_id", nullable = false)
    private PurSupplierTendering tendering;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id", nullable = false)
    private PurSupplierTenderingSupplier supplier;

    @Column(name = "sent_date")
    private LocalDateTime sentDate;

    @Column(name = "online_form_url", length = 500)
    private String onlineFormUrl;

    @Builder.Default
    @OneToMany(mappedBy = "rfq", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PurRequestForQuotationItem> items = new ArrayList<>();

    public void addItem(PurRequestForQuotationItem item) {
        item.setRfq(this);
        this.items.add(item);
    }
}
