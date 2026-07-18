package com.example.multi_tanent.fleet.dtos;


import lombok.*;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TripCustomerResponse {
    private Long id;
    private Long tenantId;
    private String customerCode;
    private String companyName;
    private String contactPerson;
    private String phone;
    private String email;
    private String trnNumber;
    private String address;
    private java.math.BigDecimal creditLimit;
    private Integer paymentTermsDays;
    private java.time.LocalDate contractStartDate;
    private java.time.LocalDate contractEndDate;
    private String contractDocumentPath;
    private String customerType;
    private Boolean active;
    public static TripCustomerResponse fromEntity(com.example.multi_tanent.fleet.entity.TripCustomer customer) {
        return TripCustomerResponse.builder()
                .id(customer.getId())
                .tenantId(customer.getTenant().getId())
                .customerCode(customer.getCustomerCode())
                .companyName(customer.getCompanyName())
                .contactPerson(customer.getContactPerson())
                .phone(customer.getPhone())
                .email(customer.getEmail())
                .trnNumber(customer.getTrnNumber())
                .address(customer.getAddress())
                .creditLimit(customer.getCreditLimit())
                .paymentTermsDays(customer.getPaymentTermsDays())
                .contractStartDate(customer.getContractStartDate())
                .contractEndDate(customer.getContractEndDate())
                .contractDocumentPath(customer.getContractDocumentPath())
                .customerType(customer.getCustomerType())
                .active(customer.getActive())
                .build();
    }

}
