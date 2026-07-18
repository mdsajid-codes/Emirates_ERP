package com.example.multi_tanent.accounts.event;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;

import java.math.BigDecimal;

@Getter
public class PaymentAllocatedEvent extends ApplicationEvent {

    private final String tenantId;
    private final Long invoiceId;
    private final String partnerType; // "CUSTOMER" or "SUPPLIER"
    private final BigDecimal allocatedAmount;

    public PaymentAllocatedEvent(Object source, String tenantId, Long invoiceId, String partnerType, BigDecimal allocatedAmount) {
        super(source);
        this.tenantId = tenantId;
        this.invoiceId = invoiceId;
        this.partnerType = partnerType;
        this.allocatedAmount = allocatedAmount;
    }
}
